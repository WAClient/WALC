pipeline {
  agent none
  stages {
    stage('Install Dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('Dist Linux') {
      steps {
        sh 'npm run dist'
      }
    }

  }
}