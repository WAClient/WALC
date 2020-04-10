pipeline {
  agent none
  stages {
    stage('Install Dependencies') {
      agent {
        node {
          label 'Install Dependencies'
        }

      }
      steps {
        sh 'npm install'
      }
    }

    stage('Dist Linux') {
      agent {
        node {
          label 'Dist Linux'
        }

      }
      steps {
        sh 'npm run dist'
      }
    }

  }
}