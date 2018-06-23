@Library('devops-library') _

// Edit your app's name below
def APP_NAME = 'frontend'
def PATHFINDER_URL = "192.168.64.2.nip.io"
def PROJECT_PREFIX = "jag-shuber"
// Edit your environment TAG names below
def TAG_NAMES = [
  'dev', 
  'test', 
  'prod'
]
def APP_URLS = [
  "https://${APP_NAME}-${PROJECT_PREFIX}-${TAG_NAMES[0]}.${PATHFINDER_URL}",
  "https://${APP_NAME}-${PROJECT_PREFIX}-${TAG_NAMES[1]}.${PATHFINDER_URL}",
  "https://${APP_NAME}-${PROJECT_PREFIX}-${TAG_NAMES[2]}.${PATHFINDER_URL}"
]

// You shouldn't have to edit these if you're following the conventions
def ARTIFACT_BUILD = APP_NAME+'-artifacts-build'
def NGINX_BUILD = 'nginx-runtime'
def RUNTIME_BUILD = APP_NAME+'-'+NGINX_BUILD+'-build'
def YARN_BUILD = 'yarn-builder'
def IMAGESTREAM_NAME = APP_NAME
def SLACK_DEV_CHANNEL="kulpreet_test"
def SLACK_MAIN_CHANNEL="kulpreet_test"

def hasRepoChanged = false;
node{
  def lastCommit = getLastCommit()
  if(lastCommit != null){
    // Ensure our CHANGE variables are set
    if(env.CHANGE_AUTHOR_DISPLAY_NAME == null){
      env.CHANGE_AUTHOR_DISPLAY_NAME = lastCommit.author.fullName
    }

    if(env.CHANGE_TITLE == null){
      env.CHANGE_TITLE = getChangeString()
    }
    hasRepoChanged = true;
  }else{
    hasRepoChanged = false;
  }
}

//if(hasRepoChanged){
  stage('Build ' + APP_NAME) {
    node{
        // Cheking template exists  or else create
        openshift.withProject() {
          def templateSelector_RUN = openshift.selector( "bc/${NGINX_BUILD}" )
          def templateExists_RUN = templateSelector_RUN.exists()

          def templateSelector_ART = openshift.selector( "bc/${ARTIFACT_BUILD}" )
          def templateExists_ART = templateSelector_ART.exists()

          def templateSelector_YARN = openshift.selector( "bc/${YARN_BUILD}" )
          def templateExists_YARN = templateSelector_YARN.exists()

          // If frontend build template doesn't exists!! It will create one to avoid failure.
          if (!templateExists_ART) { 
            
            APIBUBUILD_IMG = sh ( """oc process -f "${work_space}/openshift/templates/frontend/frontend-build.json" | oc create -f - """)
            echo ">> ${APIBUBUILD_IMG}"
          } else {
            echo "APIBUBUILD_IMG: ${ARTIFACT_BUILD} Template exists"
          }
        
          // If nginx runtime build doesn't exist!! It will create one to avoid failure.
          if (!templateExists_RUN) {
            
            APIBUILD_IMG = sh ( """oc process -f "${work_space}/openshift/templates/nginx-runtime/nginx-runtime-build.json" | oc create -f - """)
            echo ">> APIBUILD_IMG: ${APIBUILD_IMG}"
          } else {
            echo "${RUNTIME_BUILD} Template exists"
            }

          // If yarn build doesn't exist!! It will create one to avoid failure.
          if (!templateExists_YARN) {
            
            APIBUILD_IMG = sh ( """oc process -f "${work_space}/openshift/templates/yarn-builder/yarn-builder-build.json" | oc create -f - """)
            echo ">> APIBUILD_IMG: ${APIBUILD_IMG}"
          } else {
            echo "${YARN_BUILD} Template exists"
            }  
        
        try{
          echo "Building: " + ARTIFACT_BUILD
          openshiftBuild bldCfg: ARTIFACT_BUILD, showBuildLogs: 'true', waitTime: '900000'
          openshiftVerifyBuild bldCfg: ARTIFACT_BUILD, showBuildLogs: 'true', waitTime: '900000'
          openshiftVerifyBuild bldCfg: RUNTIME_BUILD, showBuildLogs: 'true', waitTime: '900000'
          // openshiftVerifyBuild bldCfg: YARN_BUILD, showBuildLogs: 'true', waitTime: '900000'
          // openshiftVerifyBuild bldCfg: NGINX_BUILD, showBuildLogs: 'true', waitTime: '900000'
          // Don't tag with BUILD_ID so the pruner can do it's job; it won't delete tagged images.
          // Tag the images for deployment based on the image's hash
          IMAGE_HASH = sh (
          script: """oc get istag ${RUNTIME_BUILD}:latest | grep sha256: | awk -F "sha256:" '{print \$3 }'""",
          returnStdout: true).trim()
          echo ">> IMAGE_HASH: ${IMAGE_HASH}"
          // if ( IMAGE_HASH:

        }catch(error){
          echo "Error in Build"
          slackNotify(
            'Build Broken 🤕',
            "The latest ${APP_NAME} build seems to have broken\n'${error.message}'",
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
        throw error
        }
      }
    }
  }
  

  // Creating Emphemeral post-gress instance for testing
  stage('Postgress Emphemeral Image'){
    node{
      try{
        echo "Creating Ephemeral Postgress instance for testing"
        POSTGRESS = sh (
          script: """oc project jag-shuber-tools; oc process -f "${work_space}/openshift/posgress-ephemeral.json" | oc create -f - """)
          echo ">> POSTGRESS: ${POSTGRESS}" 
        
      } catch(error){
        echo "Error in creating postgress instance"
        throw error
      }
    }
  }


  //Running functional Test cases - in tools project
  stage('Run Test Cases'){
    node{
    try{
      echo "Run Test Case scripts here"
      POSTGRESS_DEL = sh (
        script: """oc project jag-shuber-tools; oc process -f "${work_space}/openshift/posgress-emphemeral.json" | oc delete -f - """)
        echo ">> ${POSTGRESS_DEL}"
      echo "postgress instance deleted successfully"
    } catch(error){
      echo "Error while test cases are running"
      throw error
      }
    }
  }

  // Deploying to Dev
  stage('Deploy ' + TAG_NAMES[0]) {
    def environment = TAG_NAMES[0]
    def url = APP_URLS[0]
    node{
      try{
        openshiftTag destStream: IMAGESTREAM_NAME, verbose: 'true', destTag: environment, srcStream: IMAGESTREAM_NAME, srcTag: "${IMAGE_HASH}", waitTime: '900000'
        // verify deployment
        openshiftVerifyDeployment deploymentConfig: IMAGESTREAM_NAME, namespace: environment, waitTime: '900000'
        // Check for deployment config for api and postgress in dev environment
        // PSTGRESS_IMG = sh ( """oc project ${environment}; oc process -f "${work_space}/openshift/api-postgres-deploy.json" | oc create -f - """)
        // echo ">> PSTGRESS_IMG: ${PSTGRESS_IMG}"
        
        slackNotify(
            "New Version in ${environment} 🚀",
            "A new version of the ${APP_NAME} is now in ${environment}",
            'good',
            env.SLACK_HOOK,
            SLACK_MAIN_CHANNEL,
            [
              [
                type: "button",
                text: "View New Version",         
                url: "${url}"
              ],
              [
                type: "button",            
                text: "Deploy to Test?",
                style: "primary",              
                url: "${currentBuild.absoluteUrl}/input"
              ]
            ])
      }catch(error){
        slackNotify(
          "Couldn't deploy to ${environment} 🤕",
          "The latest deployment of the ${APP_NAME} to ${environment} seems to have failed\n'${error.message}'",
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
        echo "Error in DEV"
      }
    }
  }

  //Deploying in stable Test
  stage('Deploy ' + TAG_NAMES[1]){
    def environment = TAG_NAMES[1]
    def url = APP_URLS[1]
    timeout(time:3, unit: 'DAYS'){ input "Deploy to ${environment}?"}
    node{
    try{
      openshiftTag destStream: IMAGESTREAM_NAME, verbose: 'true', destTag: environment, srcStream: IMAGESTREAM_NAME, srcTag: "${IMAGE_HASH}", waitTime: '900000'
      // verify deployment
      openshiftVerifyDeployment deploymentConfig: IMAGESTREAM_NAME, namespace: environment, waitTime: '900000'
      slackNotify(
        "New Version in ${environment} 🚀",
        "A new version of the ${APP_NAME} is now in ${environment}",
        'good',
        env.SLACK_HOOK,
        SLACK_MAIN_CHANNEL,
          [
            [
              type: "button",
              text: "View New Version",           
              url: "${url}"
            ],
            [
              type: "button",            
              text: "Deploy to Production?",
              style: "primary",              
              url: "${currentBuild.absoluteUrl}/input"
            ]
          ])
        } catch(error){
          slackNotify(
            "Couldn't deploy to ${environment} 🤕",
            "The latest deployment of the ${APP_NAME} to ${environment} seems to have failed\n'${error.message}'",
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

  // Deploying to production
  stage('Deploy ' + TAG_NAMES[2]){
    def environment = TAG_NAMES[2]
    def url = APP_URLS[2]
    timeout(time:3, unit: 'DAYS'){ input "Deploy to ${environment}?"}
    node{
      
      try {
      // Check for current route target
      ROUT_CHK = sh (
      script: """oc project jag-shuber-prod; if [ `oc get route sheriff-scheduling-prod -o=jsonpath='{.spec.to.weight}'` == "100" ]; then `oc get route sheriff-scheduling-prod -o=jsonpath='{.spec.to.name}' > route_target`; else `oc get route sheriff-scheduling-prod -o=jsonpath='{.spec.alternateBackend[*].name}' > route_target`; fi ; cat ${workspace}/route-target""")
      // echo ">> ROUT_CHK: ${ROUT_CHK}"
      // Tag the new build as "prod"
      openshiftTag destStream: "${newTarget}", verbose: 'true', destTag: environment, srcStream: IMAGESTREAM_NAME, srcTag: "${IMAGE_HASH}", waitTime: '900000'

      // Deploy Image to the environment
      openshiftDeploy deploymentConfig: "${newTarget}", namespace: environment, waitTime: '900000'
      openshiftVerifyDeployment deploymentConfig: "${newTarget}", namespace: environment, waitTime: '900000'
      slackNotify(
          "Current production deployment mapped to ${currentTarget}",
          "New Version in ${environment} is ${newTarget}🚀",
          "A new version of the ${newTarget} is now in ${environment}",
          'To switch to new version',
          env.SLACK_HOOK,
          SLACK_MAIN_CHANNEL,
            [
              [
                type: "button",            
                text: "switch route to new version on ${newTarget}?",
                style: "primary",              
                url: "${currentBuild.absoluteUrl}/input"
              ]
            ])
    }catch(error){
      slackNotify(
              "Couldn't deploy to ${environment} 🤕",
              "The latest deployment of the ${newTarget} to ${environment} seems to have failed\n'${error.message}'",
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
    timeout(time:3, unit: 'DAYS'){ input "Switch Production from ${currentTarget} to ${newTarget} ?"}
    node{
      try{
        
        // Switch blue/green
        ROUT_PATCH = sh(
        script: """oc project jag-shuber-prod; oc set route-backends sheriff-scheduling-prod ${currentTarget}=0 ${newTarget}=100;""")
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
  def currentTarget = readFile("${workspace}/route-target")

  return currentTarget
  }

  def getNewTarget() {
  def currentTarget = getCurrentTarget()
  def newTarget = ""
  if (currentTarget == 'api-blue') {
      newTarget = 'api-green'
  } else if (currentTarget == 'api-green') {
      newTarget = 'api-blue'
  } else {
    echo "OOPS, wrong target"
  }
  return newTarget
  }
