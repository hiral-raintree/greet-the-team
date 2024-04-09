import  * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import {
  GraphqlApi,
  SchemaFile,
} from 'aws-cdk-lib/aws-appsync';
import {
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { LambdaResolverStack } from './lambda-resolver-stack';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface AppSyncProps {
  dbHost: string;
  vpc: ec2.Vpc;
}

export class AppSyncStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppSyncProps) {
    super(scope, id);

    // AWS AppSync
    const appSyncGraphQLApi = new GraphqlApi(this, "TestAppSyncAPI", {
      name: "TestAppSyncAPI",
      schema: SchemaFile.fromAsset("src/schema/schema.graphql"),
    });

    // Create role to invoke lambda data source
    const dataSourceServiceRole = new Role(
      this,
      'app-sync-lambda-invocation-role',
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

    new LambdaResolverStack(this, 'lambda-resolver', { 
      apiId: appSyncGraphQLApi.apiId,
      roleArn: dataSourceServiceRole.roleArn,
      dbHost: props.dbHost,
      vpc: props.vpc,
    });

    new cdk.CfnOutput(this, 'AppSyncAPIUrl', {
      value: appSyncGraphQLApi.graphqlUrl,
    });

    new cdk.CfnOutput(this, 'AppSyncAPIId', {
      value: appSyncGraphQLApi.apiId,
    });
  } 
}