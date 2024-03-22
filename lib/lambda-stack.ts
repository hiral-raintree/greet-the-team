import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import { Construct } from 'constructs';

export class LambdaStack extends cdk.Stack {
  public readonly lambdaFunction: lambda.Function;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.lambdaFunction = new lambda.Function(this, "greet_the_team", {
      functionName: "greet_the_team",
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset("src/lambda/basic_lambda"),
      handler: "greet_the_team.index_handler",
    });
  }
}