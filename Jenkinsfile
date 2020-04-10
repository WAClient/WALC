pipeline {
  agent none
  stages {
    stage('Install Dependencies') {
      agent {
        node {
          label 'nodejs'
        }

      }
      steps {
        sh 'npm install'
      }
    }

    stage('Dist Linux') {
      agent {
        node {
          label 'nodejs'
        }

      }
      steps {
        sh 'npm run dist'
      }
    }

  }
}