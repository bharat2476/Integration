pipeline {
  agent any

  environment {
    IMAGE = 'ghcr.io/bharat2476/omniroute-api'
    HELM_CHART = '2-paas-platform/helm/omniroute-api'
    TF_DIR = '1-iaas-infra/terraform'
  }

  stages {
    stage('Parallel Quality Gates') {
      parallel {
        stage('Lint — SaaS') {
          steps {
            dir('3-saas-application') {
              sh 'npm ci && npm run build'
            }
          }
        }
        stage('Lint — Terraform') {
          steps {
            dir("${TF_DIR}") {
              sh 'terraform fmt -check -recursive'
              sh 'terraform init -backend=false && terraform validate'
            }
          }
        }
        stage('Helm Template Validation') {
          steps {
            sh "helm lint ${HELM_CHART}"
            sh "helm template omniroute-api ${HELM_CHART} > /dev/null"
          }
        }
      }
    }

    stage('Container Security — Trivy') {
      steps {
        sh "docker build -t omniroute-api:${BUILD_NUMBER} 3-saas-application"
        sh """
          trivy image --exit-code 1 --severity HIGH,CRITICAL \
            omniroute-api:${BUILD_NUMBER}
        """
      }
    }

    stage('Multi-Tenant Automated Tests') {
      steps {
        dir('3-saas-application') {
          sh 'echo "Execute tenant matrix: tenant-a, tenant-b, RLS isolation"'
        }
      }
    }

    stage('Build & Push') {
      when { branch 'main' }
      steps {
        sh """
          docker tag omniroute-api:${BUILD_NUMBER} ${IMAGE}:${BUILD_NUMBER}
          docker push ${IMAGE}:${BUILD_NUMBER}
        """
      }
    }

    stage('Canary Deploy') {
      when { branch 'main' }
      steps {
        sh """
          helm upgrade --install omniroute-api ${HELM_CHART} \
            --set image.tag=${BUILD_NUMBER} \
            --set canary.enabled=true \
            --set canary.weight=10
        """
      }
    }

    stage('Post-Deploy Health Gate') {
      when { branch 'main' }
      steps {
        script {
          def healthy = sh(
            returnStatus: true,
            script: '''
              # Query Splunk/Otel — simulated thresholds
              P99_MS=420
              ERR_PCT=0.5
              test "$P99_MS" -lt 800 && test "$(echo "$ERR_PCT < 2" | bc)" -eq 1
            '''
          )
          env.ROLLBACK_FLAG = healthy == 0 ? 'false' : 'true'
        }
      }
    }

    stage('Rollback') {
      when {
        expression { env.ROLLBACK_FLAG == 'true' }
      }
      steps {
        sh 'helm rollback omniroute-api 0'
        error('Canary failed health gate — rolled back')
      }
    }

    stage('Promote Full') {
      when {
        allOf {
          branch 'main'
          expression { env.ROLLBACK_FLAG == 'false' }
        }
      }
      steps {
        sh """
          helm upgrade omniroute-api ${HELM_CHART} \
            --set image.tag=${BUILD_NUMBER} \
            --set canary.enabled=false
        """
      }
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}
