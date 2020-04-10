pipeline {
  agent {
    node {
      label 'Install-Dependencies'
    }

  }
  stages {
    stage('Install Dependencies') {
      steps {
        sh 'npm install'
      }
    }

  }
}