import { Construct } from 'constructs';
import { CfnGraphQLApi } from "aws-cdk-lib/aws-appsync";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { CfnOutput } from "aws-cdk-lib";

interface RTMergedApiProps {
  name: string;
}

export class RTMergedApiStack extends Construct {
  private rtMergedApi: CfnGraphQLApi;

  constructor(scope: Construct, id: string, props: RTMergedApiProps) {
    super(scope, id);

    const executionRole = new Role(this, 'MergedApiExecutionRole', {
      assumedBy: new ServicePrincipal('appsync.amazonaws.com')
    });

    this.rtMergedApi = new CfnGraphQLApi(this, 'RTMergedApi', {
      authenticationType: "AWS_IAM",
      name: `graphql-merged-api-${props.name}`,
      apiType: 'MERGED',
      mergedApiExecutionRoleArn: executionRole.roleArn,
    });

    new CfnOutput(this, 'RTMergedApiId', {
      exportName: `RTMergedApiId`,
      value: this.rtMergedApi.attrApiId
    });
  }
}