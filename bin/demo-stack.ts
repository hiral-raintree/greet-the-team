#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { RTProviderServiceCognitoUserPool } from '../lib/cognito-stack';
import { RTProviderAppSyncAPI } from '../lib/provider-appsync-stack';
import { RDSStack } from '../lib/rds-stack';
import { MergedAPIStack } from '../lib/merged-api-stack';

import { LambdaStack } from '../lib/lambda-stack'; 
import { EventBus } from 'aws-cdk-lib/aws-events'
import { Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { ParameterTier, StringParameter } from 'aws-cdk-lib/aws-ssm';
import { RemovalPolicy } from 'aws-cdk-lib';

const app = new cdk.App();

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

    // Creating SSM parameter for authentication 
    new StringParameter(this, 'authenticationToken', {
      parameterName: 'authenticationToken',
      stringValue: 'g5U7bG6CzB8sxNpl5W049X0oSfkGSkpW',
      description: 'Authentication Token',
      tier: ParameterTier.STANDARD,
    }).applyRemovalPolicy(RemovalPolicy.DESTROY); 

    // const { userPool, userPoolClient } = new RTProviderServiceCognitoUserPool(
    //   this,
    //   'RT-provider-service-cognito-pool',
    //   {
    //     domainPrefix: `rt-provider-service-login`,
    //     userPoolName: `RT-provider-service-user-pool`,
    //     signInCaseSegnsitive: true,
    //   }
    // );

    // Create RDS
    const AuroraDB = new RDSStack(this, `rds-${id}`,
    {
      vpc: RTPSvpc
    });

    // TODO: Create token from lambda 
    // 

    // Create Provider AppSync API
    const appSyncAPIName = `RT-provider-appSync-API`;
    new RTProviderAppSyncAPI(this, appSyncAPIName, {
      name: appSyncAPIName,
      // userPoolId: userPool.userPoolId  as string,
      // this will be the endpoint of the cluster 
      dbHost: AuroraDB.rdsCluster.clusterEndpoint.hostname,
      vpc: RTPSvpc,
      eventBusArn: 'arn:aws:events:us-east-1:807198808460:event-bus/RTEventBus' 
    });

    // Create required parameters to run integration tests
    // new cdk.CfnOutput(this, 'UserPoolsId', {
    //   value: userPool.userPoolId,
    // });

    // new cdk.CfnOutput(this, 'UserPoolsWebClientId', {
    //   value: userPoolClient.userPoolClientId,
    // });

  }
}

export class RTMergedAPIStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
  ) {
    super(scope, id);
    new MergedAPIStack(this, 'RTMergedAPI', { name: 'RTMergedAPI' });
  }
}

// Instantiate the Merged API Stack Class
// new RTMergedAPIStack(app, 'RT-Provider-Service-Merged-API')


export class RTEventBridgeStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
  ) {
    super(scope, id);

    const bus = new EventBus(this,'RTEventBus',{
      eventBusName: "RTEventBus"
    })

    const rule = new Rule(this, "RTEventRule", {
      description: "RTEventRuleDescription",
      eventPattern: {
        source: ["aws.lambda"]
      },
      eventBus: bus
    });

    const basicLambda = new LambdaStack(this, 'RT-basic-lambda-stack', { eventBusARN: bus.eventBusArn })

    rule.addTarget(new LambdaFunction(basicLambda.lambdaFunction));

    new cdk.CfnOutput(this, 'EventBusARN', {
      value: bus.eventBusArn,
    });

    new cdk.CfnOutput(this, 'EventRuleARN', {
      value: rule.ruleArn,
    });
  }
}

// Instantiate the Merged API Stack Class
// new RTEventBridgeStack(app, 'RT-Provider-Service-EventBridge')


// instantiate the main stack class  
new RTProviderServiceStack(app, 'RT-Provider-Service');