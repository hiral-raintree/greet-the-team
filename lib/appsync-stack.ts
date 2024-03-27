import  * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import {
  GraphqlApi,
  SchemaFile,
} from 'aws-cdk-lib/aws-appsync';
import { LambdaResolverStack } from './lambda-resolver-stack';


export class AppSyncStack extends cdk.Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // AWS AppSync
    const appSyncGraphQLApi = new GraphqlApi(this, "TestAppSyncAPI", {
      name: "TestAppSyncAPI",
      schema: SchemaFile.fromAsset("src/schema/schema.graphql"),
    });

    new LambdaResolverStack(this, 'lambda-resolver', { 
      apiId: appSyncGraphQLApi.apiId
    });

    new cdk.CfnOutput(this, 'AppSyncAPIUrl', {
      value: appSyncGraphQLApi.graphqlUrl,
    });

    new cdk.CfnOutput(this, 'AppSyncAPIId', {
      value: appSyncGraphQLApi.apiId,
    });
  } 
}