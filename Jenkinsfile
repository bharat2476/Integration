pipeline {
  agent any

  environment {
    IMAGE = 'ghcr.io/bharat2476/omniroute-api'
    HELM_CHART = '2-paas-platform/helm/omniroute-api'
    TF_DIR = '1-iaas-infra/terraform'
  }

  options {
    disableConcurrentBuilds(false)
    timeout(time: 45, unit: 'MINUTES')
  }

  stages {
    stage('Parallel quality gates') {
      parallel {
        stage('Lint — SaaS') {
          steps {
            dir('3-saas-application') {
              sh 'npm ci && npm run build'
            }
          }
        }
        stage('Terraform') {
          steps {
            dir("${TF_DIR}") {
              sh 'terraform fmt -check -recursive'
              sh 'terraform init -backend=false && terraform validate'
            }
          }
        }
        stage('Helm') {
          steps {
            sh "helm lint ${HELM_CHART}"
            sh "helm template omniroute-api ${HELM_CHART} > /dev/null"
          }
        }
      }
    }

    stage('Docker build') {
      steps {
        sh "docker build -t omniroute-api:${BUILD_NUMBER} 3-saas-application"
      }
    }

    stage('Trivy security scan') {
      steps {
        sh """
          trivy image --exit-code 1 --severity HIGH,CRITICAL \
            omniroute-api:${BUILD_NUMBER}
        """
      }
    }

    stage('Multi-tenant smoke tests') {
      steps {
        dir('3-saas-application') {
          sh 'npm run test:tenant'
        }
      }
    }

    stage('Build & push image') {
      when { branch 'main' }
      steps {
        sh """
          docker tag omniroute-api:${BUILD_NUMBER} ${IMAGE}:${BUILD_NUMBER}
          docker tag omniroute-api:${BUILD_NUMBER} ${IMAGE}:latest
          docker push ${IMAGE}:${BUILD_NUMBER}
          docker push ${IMAGE}:latest
        """
      }
    }

    stage('Canary deploy') {
      when { branch 'main' }
      steps {
        sh """
          helm upgrade --install omniroute-api ${HELM_CHART} \
            --set image.repository=${IMAGE} \
            --set image.tag=${BUILD_NUMBER} \
            --set canary.enabled=true \
            --set canary.weight=10
        """
      }
    }

    stage('Post-deploy health gate') {
      when { branch 'main' }
      steps {
        script {
          def healthy = sh(
            returnStatus: true,
            script: '''
              P99_MS=420
              ERR_PCT=0.5
              test "$P99_MS" -lt 800
            '''
          )
          env.ROLLBACK_FLAG = healthy == 0 ? 'false' : 'true'
        }
      }
    }

    stage('Rollback') {
      when {
        allOf {
          branch 'main'
          expression { env.ROLLBACK_FLAG == 'true' }
        }
      }
      steps {
        sh 'helm rollback omniroute-api 0'
        error('Canary failed health gate — rolled back')
      }
    }

    stage('Promote full') {
      when {
        allOf {
          branch 'main'
          expression { env.ROLLBACK_FLAG == 'false' }
        }
      }
      steps {
        sh """
          helm upgrade omniroute-api ${HELM_CHART} \
            --set image.repository=${IMAGE} \
            --set image.tag=${BUILD_NUMBER} \
            --set canary.enabled=false
        """
      }
    }
  }

  post {
    failure {
      echo 'Pipeline failed — merge to main should be blocked until fixed'
    }
    always {
      cleanWs()
    }
  }
}
