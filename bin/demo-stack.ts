#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import { LambdaStack } from '../lib/lambda-stack';
// import { AppSyncStack } from '../lib/appsync-stack';
import { RTProviderServiceCognitoUserPool } from '../lib/cognito-stack';
import { RTProviderAppSyncAPI } from '../lib/provider-appsync-stack';

const app = new cdk.App();

// create a new Lambda
// new LambdaStack(app, 'lambdaStack');
// new AppSyncStack(app, 'appSyncStack');

export class RTProviderServiceStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
  ) {
    super(scope, id);

    const { userPool, userPoolClient } = new RTProviderServiceCognitoUserPool(
      this,
      'RT-provider-service-cognito-pool',
      {
        domainPrefix: `rt-provider-service-login`,
        userPoolName: `RT-provider-service-user-pool`,
        signInCaseSensitive: true,
      }
    );

    // Create Provider AppSync API
    const appSyncAPIName = `RT-provider-appSync-API`;
    new RTProviderAppSyncAPI(this, appSyncAPIName, {
      name: appSyncAPIName,
      userPoolId: userPool.userPoolId  as string,
    });

    // Create Merged AppSync API
    // const mergedAppSyncAPIName = `RT-provider-merged-API`;
    // new RTMergedApiStack(this, mergedAppSyncAPIName, {
    //   name: mergedAppSyncAPIName,
    //   providerSourceAPI: RTProviderAppSyncSourceAPI,
    // });

    // Create required parameters to run integration tests
    new cdk.CfnOutput(this, 'UserPoolsId', {
      value: userPool.userPoolId,
    });

    new cdk.CfnOutput(this, 'UserPoolsWebClientId', {
      value: userPoolClient.userPoolClientId,
    });

  }
}

// instantiate the main stack class  
new RTProviderServiceStack(app, 'RT-Provider-Service');