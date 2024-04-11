import { NestedStack, NestedStackProps, CfnOutput, Duration } from 'aws-cdk-lib'
import { Function, Code, Runtime, LayerVersion} from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs'
import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { join } from 'path';

interface LambdaAuthorizerStackProps {
    eventBusARN: string;
}

export class LambdaAuthorizerStack extends NestedStack{
    readonly LambdaAuth: Function
    constructor(scope: Construct, id: string, props: LambdaAuthorizerStackProps){
        super(scope,id)

        const LambdaAuth = new NodejsFunction(this, 'provider-appsync-auth-lambda', {
            entry: join(__dirname, '../src/lambda/auth_lambda/appsync-auth.handler.ts'),
            runtime: Runtime.NODEJS_18_X,
            handler: 'handler',
          });

          LambdaAuth.role?.attachInlinePolicy(
            new iam.Policy(this, 'logGroupPolicy', {
              document: new iam.PolicyDocument({
                statements: [
                  new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: [
                        'logs:CreateLogGroup',
                        'logs:CreateLogStream',
                        'logs:PutLogEvents',
                      ],
                    resources: [`arn:aws:logs:us-east-1:807198808460:*`],
                  }),
                ],
              }),
            })
        );
    this.LambdaAuth = LambdaAuth;
    }
}