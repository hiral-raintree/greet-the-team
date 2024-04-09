import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';

import { Construct } from 'constructs';

interface lambdaStackProps {
  eventBusARN: string;
}

export class LambdaStack extends Construct {
  public readonly lambdaFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: lambdaStackProps) {
    super(scope, id);

    this.lambdaFunction = new lambda.Function(this, "RT-greet_the_team", {
      functionName: "RT-greet_the_team",
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset("src/lambda/basic_lambda"),
      handler: "greet_the_team.index_handler",
    });

    this.lambdaFunction.role?.attachInlinePolicy(
      new iam.Policy(this, 'eventBusPolicy', {
        document: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['events:PutEvents'],
              resources: [props.eventBusARN],
            }),
          ],
        }),
      })
    )
  }
}