# Karpenter NodePool / EC2NodeClass — dynamic node provisioning for event-queue spikes.

resource "aws_iam_role" "karpenter_controller" {
  count = var.enable_karpenter ? 1 : 0
  name  = "${local.name_prefix}-karpenter-controller"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/${replace(aws_eks_cluster.core.identity[0].oidc[0].issuer, "https://", "")}"
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${replace(aws_eks_cluster.core.identity[0].oidc[0].issuer, "https://", "")}:sub" = "system:serviceaccount:karpenter:karpenter"
          "${replace(aws_eks_cluster.core.identity[0].oidc[0].issuer, "https://", "")}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })

  tags = local.common_tags
}

data "aws_caller_identity" "current" {}

resource "aws_iam_policy" "karpenter" {
  count = var.enable_karpenter ? 1 : 0
  name  = "${local.name_prefix}-karpenter"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ec2:CreateLaunchTemplate", "ec2:CreateFleet", "ec2:RunInstances", "ec2:CreateTags", "ec2:TerminateInstances", "ec2:Describe*"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["iam:PassRole"]
        Resource = aws_iam_role.eks_node.arn
      },
      {
        Effect   = "Allow"
        Action   = ["eks:DescribeCluster"]
        Resource = aws_eks_cluster.core.arn
      },
      {
        Effect   = "Allow"
        Action   = ["pricing:GetProducts"]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "karpenter" {
  count      = var.enable_karpenter ? 1 : 0
  role       = aws_iam_role.karpenter_controller[0].name
  policy_arn = aws_iam_policy.karpenter[0].arn
}

# Karpenter NodePool manifests: 2-paas-platform/karpenter/nodepool-workloads.yaml (applied via Helm/CI)
