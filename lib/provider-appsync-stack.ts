import {
  AuthorizationType,
  CfnGraphQLApi,
  CfnGraphQLSchema,
} from 'aws-cdk-lib/aws-appsync';
import {
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { CfnOutput, Tags } from 'aws-cdk-lib';
import { LambdaResolverStack } from './lambda-resolver-stack';
import { LambdaProviderResolverStack } from './lambda-provider-resolver-stack';
import { readFileSync } from "fs";
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { LambdaAuthorizerStack } from './provider-appsync-lambda-authorizer'; 

interface RTProviderAppSyncProps {
  name: string;
  // userPoolId: string;
  dbHost: string;
  vpc: ec2.Vpc;
  eventBusArn: string;
}

export class RTProviderAppSyncAPI extends Construct {
  constructor(scope: Construct, id: string, props: RTProviderAppSyncProps) {
    super(scope, id);

    const { LambdaAuth } = new LambdaAuthorizerStack(this, "AppSync-lambda-authorizer", {
      eventBusARN: props.eventBusArn
    })

    const appSyncGraphQLApi = new CfnGraphQLApi(this, `graphql-api-${id}`, {
      name: `graphql-api-${props.name}`,
      authenticationType: AuthorizationType.LAMBDA,
      lambdaAuthorizerConfig: {
        authorizerResultTtlInSeconds: 5,
        authorizerUri: LambdaAuth.functionArn,
      },
      // lambdaAuthorizerConfig: {
      //   authorizerUri: LambdaAuth.functionArn
      // },

      // authenticationType: "AMAZON_COGNITO_USER_POOLS",
      // userPoolConfig: {
      //   userPoolId: props.userPoolId,
      //   defaultAction: "ALLOW",
      //   awsRegion: "us-east-1",
      // }
    });

    LambdaAuth.functionArn
    new CfnOutput(this, 'LambdaAuth.functionArn', {
      value: LambdaAuth.functionArn,
    });

    new CfnGraphQLSchema(this, "ProvicerAppsyncApiSchema", {
      apiId: appSyncGraphQLApi.attrApiId,
      definition: readFileSync("src/schema/schema.graphql").toString(),
    });

    // Role to invoke lambda data source
    const appsyncLambdaRole = new Role(
      this,
      'RT-provider-appSync-lambda-invocation-role',
      {
        assumedBy: new ServicePrincipal('appsync.amazonaws.com'),
        inlinePolicies: {
          lambdaInvoke: new PolicyDocument({
            statements: [
              new PolicyStatement({
                effect: Effect.ALLOW,
                actions: ['lambda:invokeFunction'],
                resources: ['*'],
              }),
            ],
          }),
        },
      }
    );

    new LambdaProviderResolverStack(this, 'provider-lambda-resolver', {
      apiId: appSyncGraphQLApi.attrApiId,
      roleArn: appsyncLambdaRole.roleArn,
      dbHost: props.dbHost,
      vpc: props.vpc,
    })

    // new LambdaResolverStack(this, 'lambda-resolver', { 
    //   apiId: appSyncGraphQLApi.attrApiId,
    //   roleArn: appsyncLambdaRole.roleArn,
    //   dbHost: props.dbHost,
    //   vpc: props.vpc,
    // });

    // Output configs to run tests
    // AppSync API url
    new CfnOutput(this, 'AppSyncAPIUrl', {
      value: appSyncGraphQLApi.attrGraphQlUrl,
    });

    // AppSync API id
    new CfnOutput(this, 'AppSyncAPIId', {
      value: appSyncGraphQLApi.attrApiId,
    });
  }
}
