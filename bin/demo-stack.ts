#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import { LambdaStack } from '../lib/lambda-stack';
// import { AppSyncStack } from '../lib/appsync-stack';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { RTProviderServiceCognitoUserPool } from '../lib/cognito-stack';
import { RTProviderAppSyncAPI } from '../lib/provider-appsync-stack';
import { RDSStack } from '../lib/rds-stack';

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

    // Create VPC
    const RTPSvpc = new ec2.Vpc(this, 'RT-Provider-Service-VPC');

    new cdk.CfnOutput(this, 'VPC ID', {
      value: RTPSvpc.vpcId,
      description: 'VPC ID',
    });

    const { userPool, userPoolClient } = new RTProviderServiceCognitoUserPool(
      this,
      'RT-provider-service-cognito-pool',
      {
        domainPrefix: `rt-provider-service-login`,
        userPoolName: `RT-provider-service-user-pool`,
        signInCaseSensitive: true,
      }
    );

    // Create RDS
    const AuroraDB = new RDSStack(this, `rds-${id}`,
    {
      vpc: RTPSvpc
    });

    // Create Provider AppSync API
    const appSyncAPIName = `RT-provider-appSync-API`;
    new RTProviderAppSyncAPI(this, appSyncAPIName, {
      name: appSyncAPIName,
      userPoolId: userPool.userPoolId  as string,
      dbHost: AuroraDB.rdsCluster.clusterEndpoint.hostname,
      vpc: RTPSvpc,
    });

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