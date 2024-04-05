import {
  CfnGraphQLApi,
  CfnGraphQLSchema,
  CfnSourceApiAssociation,
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
import { readFileSync } from "fs";

interface RTProviderAppSyncProps {
  name: string;
  userPoolId: string;
  mergedApiId: string;
}

export class RTProviderAppSyncAPI extends Construct {
  constructor(scope: Construct, id: string, props: RTProviderAppSyncProps) {
    super(scope, id);

    const appSyncGraphQLApi = new CfnGraphQLApi(this, `graphql-api-${id}`, {
      name: `graphql-api-${props.name}`,
      authenticationType: "AMAZON_COGNITO_USER_POOLS",
      userPoolConfig: {
        userPoolId: props.userPoolId,
        defaultAction: "ALLOW",
        awsRegion: "us-east-1",
      }
    });

    const apiSchema = new CfnGraphQLSchema(this, "ProvicerAppsyncApiSchema", {
      apiId: appSyncGraphQLApi.attrApiId,
      definition: readFileSync("src/schema/schema.graphql").toString(),
    });

    appSyncGraphQLApi.addDependency(apiSchema)

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

    new LambdaResolverStack(this, 'lambda-resolver', { 
      apiId: appSyncGraphQLApi.attrApiId,
      roleArn: appsyncLambdaRole.roleArn
    });

    // Map the Provider Appsync API with Merged API
    new CfnSourceApiAssociation(this, 'AppSyncSourceAPIAssociation', {
      sourceApiIdentifier: appSyncGraphQLApi.attrApiId,
      mergedApiIdentifier: props.mergedApiId,
      sourceApiAssociationConfig: {
        mergeType: 'AUTO_MERGE',
      },
    });

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
