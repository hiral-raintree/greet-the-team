import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { CfnDataSource, CfnResolver } from 'aws-cdk-lib/aws-appsync';

import { Construct } from 'constructs';

interface ResolverLambdaPros {
  apiId: string;
  roleArn: string;
}

export class LambdaResolverStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ResolverLambdaPros) {
    super(scope, id);

    const lambdaFunction = new lambda.Function(this, "resolver_lambda", {
      functionName: "resolver_lambda",
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset("src/lambda/resolver-lambda"),
      handler: "resolver_lambda.index_handler",
    });

    const APIDataSource = new CfnDataSource(this, 'data-source', {
      apiId: props.apiId,
      name: 'DataSource',
      type: 'AWS_LAMBDA',
      lambdaConfig: {
        lambdaFunctionArn: lambdaFunction.functionArn,
      },
      serviceRoleArn: props.roleArn
    });

    const Resolver = new CfnResolver(this, `resolver`, {
      apiId: props.apiId,
      typeName: 'Query',
      fieldName: 'getBookByTitle',
      dataSourceName: APIDataSource.name,
    });
    Resolver.addDependency(APIDataSource);
  }
}