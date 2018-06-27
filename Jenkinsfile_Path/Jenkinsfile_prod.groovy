@Library('devops-library') _

// Edit your app's name below
def APP_NAME_F = 'frontend'
def APP_NAME_A = 'shuber-api'
def PATHFINDER_URL = "192.168.64.2.nip.io"
def PROJECT_PREFIX = "jag-shuber"
// Edit your environment TAG names below
def TAG_NAMES = [
  'prod'
]
def APP_URLS = [
  "https://${APP_NAME_F}-${PROJECT_PREFIX}-${TAG_NAMES[0]}.${PATHFINDER_URL}"
]

// You shouldn't have to edit these if you're following the convention
def FRONTEND_IMAGESTREAM_NAME = APP_NAME_F
def API_IMAGESTREAM_NAME = APP_NAME_A
def SLACK_DEV_CHANNEL="kulpreet_test"
def SLACK_MAIN_CHANNEL="kulpreet_test"
def work_space="/var/lib/jenkins/jobs/jag-shuber-tools/jobs/Jag-shuber-prod-deploy"


  // Deploying to production
  stage('Deploy ' + TAG_NAMES[0]){
    def environment = TAG_NAMES[0]
    def url = APP_URLS[0]
    def newTarget = getNewTarget()
    def currentTarget = getCurrentTarget()
    timeout(time:3, unit: 'DAYS'){ input "Deploy to ${environment}?"}
    node{
      
      try {
      ROUT_CHK = sh (
      script: """oc project jag-shuber-prod; if [ `oc get route sheriff-scheduling-prod -o=jsonpath='{.spec.to.weight}'` == "100" ]; then `oc get route sheriff-scheduling-prod -o=jsonpath='{.spec.to.name}' > ${env.WORKSPACE}/route-target`; else `oc get route sheriff-scheduling-prod -o=jsonpath='{.spec.alternateBackend[*].name}' > ${env.WORKSPACE}/route-target`; fi""")
      echo ">> ROUT_CHK: ${ROUT_CHK}"
      // Deploy Fontend Image to the production environment
      openshiftDeploy deploymentConfig: APP_NAME_F+"-"+newTarget, namespace: "${PROJECT_PREFIX}"+"-"+environment, waitTime: '900000'
      openshiftVerifyDeployment deploymentConfig: APP_NAME_F+"-"+newTarget, namespace: "${PROJECT_PREFIX}"+"-"+environment, waitTime: '900000'

      //Deploy API Image to the production environment
      openshiftDeploy deploymentConfig: APP_NAME_A+"-"+newTarget, namespace: "${PROJECT_PREFIX}"+"-"+environment, waitTime: '900000'
      openshiftVerifyDeployment deploymentConfig: APP_NAME_A+"-"+newTarget, namespace: "${PROJECT_PREFIX}"+"-"+environment, waitTime: '900000'

      slackNotify(
          "Current production stack mapped to ${currentTarget}",
          "New Version in ${environment} is ${newTarget} stack🚀",
          'To switch to new version',
          env.SLACK_HOOK,
          SLACK_MAIN_CHANNEL,
            [
              [
                type: "button",            
                text: "switch route to new version on ${newTarget} stack?",
                style: "primary",              
                url: "${currentBuild.absoluteUrl}/input"
              ]
            ])
    }catch(error){
      slackNotify(
              "Couldn't deploy to ${environment} 🤕",
              "The latest deployment of the ${newTarget} stack to ${environment} seems to have failed\n'${error.message}'",
              'danger',
            env.SLACK_HOOK,
            SLACK_DEV_CHANNEL,
            [
              [
                type: "button",
                text: "View Build Logs",
                style:"danger",        
                url: "${currentBuild.absoluteUrl}/console"
              ]
            ])
            echo "Build failed"
    }
  }
  }

  // Once approved (input step) switch production over to the new version.
  stage('Switch over to new Version') {
    def newTarget = getNewTarget()
    def currentTarget = getCurrentTarget()
    // Wait for administrator confirmation
    timeout(time:3, unit: 'DAYS'){ input "Switch Production from ${currentTarget} stack to ${newTarget} stack?"}
    node{
      try{
        
        // Switch blue/green
        ROUT_PATCH = sh(
        script: """oc project jag-shuber-prod; oc set route-backends sheriff-scheduling-prod ${APP_NAME_F}+"-"+${currentTarget}=0 ${APP_NAME_F}+"-"+${newTarget}=100;""")
        echo ">> ROUT_PATCH: ${ROUT_PATCH}"
      }catch(error){
        echo "Failed to switch route"
        throw error
      }
  }
  }

  // }else{
  //   stage('No Changes to Build 👍'){
  //     currentBuild.result = 'SUCCESS'
  //   }
  // }

// // Functions to check currentTarget (api-blue)deployment and mark to for deployment to newTarget(api-green) & vice versa
  def getCurrentTarget() {

  //def input = readFile("${work_space}/route-target") 
    currentTarget = sh (
      script: """cat ${env.WORKSPACE}/route-target | awk -F"-" '{print \$2}' """)
      // echo ">> ROUT_CHK: ${ROUT_CHK}"
    return currentTarget
  }

  def getNewTarget() {
  def currentTarget = getCurrentTarget()
  def newTarget = ""
  if (currentTarget == 'blue') {
      newTarget = 'green'
  } else if (currentTarget == 'green') {
      newTarget = 'blue'
  } else {
    echo "OOPS, wrong target"
  }
  return newTarget
  }
