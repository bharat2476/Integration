# OPTIONAL AWS REFERENCE SAMPLE ONLY — not used in production OmniRoute/Nike integrations.
# Production uses SQL (structured) + MongoDB (JSON). See README.md "Data platform".
# RDS PostgreSQL — sample pattern for schema-per-tenant + RLS on AWS.

resource "aws_db_subnet_group" "core" {
  name       = "${local.name_prefix}-db-subnets"
  subnet_ids = aws_subnet.database[*].id

  tags = merge(local.common_tags, { Name = "${local.name_prefix}-db-subnet-group" })
}

resource "random_password" "rds_master" {
  length  = 32
  special = true
}

resource "aws_secretsmanager_secret" "rds_master" {
  name = "${local.name_prefix}/rds/master"
  tags = local.common_tags
}

resource "aws_secretsmanager_secret_version" "rds_master" {
  secret_id = aws_secretsmanager_secret.rds_master.id
  secret_string = jsonencode({
    username = "omniroute_admin"
    password = random_password.rds_master.result
    engine   = "postgres"
    host     = aws_db_instance.core.address
    port     = 5432
    dbname   = "omniroute_core"
  })
}

resource "aws_db_parameter_group" "postgres16" {
  family = "postgres16"
  name   = "${local.name_prefix}-pg16"

  parameter {
    name  = "rds.force_ssl"
    value = "1"
  }

  parameter {
    name  = "log_statement"
    value = "ddl"
  }

  tags = local.common_tags
}

resource "aws_db_instance" "core" {
  identifier     = "${local.name_prefix}-postgres"
  engine         = "postgres"
  engine_version = "16.4"
  instance_class = var.rds_instance_class

  allocated_storage     = var.rds_allocated_storage_gb
  max_allocated_storage = var.rds_allocated_storage_gb * 2
  storage_encrypted     = true
  kms_key_id            = null # Use default AWS managed key or wire CMK per compliance

  db_name  = "omniroute_core"
  username = "omniroute_admin"
  password = random_password.rds_master.result

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.core.name
  parameter_group_name   = aws_db_parameter_group.postgres16.name

  multi_az               = var.environment == "prod"
  backup_retention_period = var.environment == "prod" ? 35 : 7
  deletion_protection    = var.environment == "prod"
  skip_final_snapshot    = var.environment != "prod"

  performance_insights_enabled = true
  monitoring_interval          = 60

  tags = merge(local.common_tags, { Name = "${local.name_prefix}-rds" })
}

# Post-provision: apply tenant RLS via migration job (see sql/tenant_rls_bootstrap.sql)
resource "null_resource" "tenant_rls_marker" {
  triggers = {
    rds_endpoint = aws_db_instance.core.endpoint
    schema_count = var.tenant_schema_count
  }

  provisioner "local-exec" {
    when    = create
    command = "echo Apply ${path.module}/sql/tenant_rls_bootstrap.sql against ${aws_db_instance.core.endpoint}"
  }
}
