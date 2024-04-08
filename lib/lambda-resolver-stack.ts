import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { CfnDataSource, CfnResolver } from 'aws-cdk-lib/aws-appsync';
import * as iam from 'aws-cdk-lib/aws-iam';

import { Construct } from 'constructs';

interface ResolverLambdaPros {
  apiId: string;
  roleArn: string;
  dbHost: string;
}

export class LambdaResolverStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ResolverLambdaPros) {
    super(scope, id);
    const eventBusARN = 'arn:aws:sns:us-east-1:807198808460:Providers'

    const providerLambdaFunction = new lambda.Function(this, "resolver_lambda", {
      functionName: "resolver_lambda",
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset("src/lambda/resolver-lambda"),
      handler: "resolver_lambda.index_handler",
    });

    providerLambdaFunction.role?.attachInlinePolicy(
      new iam.Policy(this, 'eventBusPolicy', {
        document: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['events:PutEvents'],
              resources: [eventBusARN],
            }),
          ],
        }),
      })
    );

    const providerDataSource = new CfnDataSource(this, 'provider-data-source', {
      apiId: props.apiId,
      name: 'providerDataSource',
      type: 'AWS_LAMBDA',
      lambdaConfig: {
        lambdaFunctionArn: providerLambdaFunction.functionArn,
      },
      serviceRoleArn: props.roleArn,
    });

    const createProviderResolver = new CfnResolver(this, `provider-resolver`, {
      apiId: props.apiId,
      typeName: 'Mutation',
      fieldName: 'createProvider',
      dataSourceName: providerDataSource.name,
    });
    createProviderResolver.addDependency(providerDataSource);

    const updateProviderResolver = new CfnResolver(this, 'update-provider-resolver', {
      apiId: props.apiId,
      typeName: 'Mutation',
      fieldName: 'updateProvider',
      dataSourceName: providerDataSource.name,
    });
    updateProviderResolver.addDependency(providerDataSource);

    const deleteProviderResolver = new CfnResolver(this, `delete-provider-resolver`, {
      apiId: props.apiId,
      typeName: 'Mutation',
      fieldName: 'deleteProvider',
      dataSourceName: providerDataSource.name,
    });
    deleteProviderResolver.addDependency(providerDataSource);

    const getProviderResolver = new CfnResolver(this, 'get-provider-resolver', {
      apiId: props.apiId,
      typeName: 'Query',
      fieldName: 'getProvider',
      dataSourceName: providerDataSource.name,
    });
    getProviderResolver.addDependency(providerDataSource);

    const listProviderResolver = new CfnResolver(this, 'list-provider-resolver', {
      apiId: props.apiId,
      typeName: 'Query',
      fieldName: 'listProvider',
      dataSourceName: providerDataSource.name,
    });
    listProviderResolver.addDependency(providerDataSource);
  }
}