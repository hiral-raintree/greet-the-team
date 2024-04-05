import { Construct } from 'constructs';
import { GraphqlApi, Definition, MergeType } from 'aws-cdk-lib/aws-appsync';
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { RTProviderAppSyncAPI } from './provider-appsync-stack';

interface RTMergedApiProps {
  name: string;
  providerSourceAPI: RTProviderAppSyncAPI;
}

export class RTMergedApiStack extends Construct {
  private rtMergedApi: GraphqlApi;

  constructor(scope: Construct, id: string, props: RTMergedApiProps) {
    super(scope, id);

    const executionRole = new Role(this, 'MergedApiExecutionRole', {
      assumedBy: new ServicePrincipal('appsync.amazonaws.com')
    });

  }
}