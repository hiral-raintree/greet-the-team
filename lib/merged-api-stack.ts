import {
  CfnGraphQLApi,
  CfnSourceApiAssociation,
} from 'aws-cdk-lib/aws-appsync';
import { Construct } from 'constructs';
import { CfnOutput } from 'aws-cdk-lib';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

interface ATTAppSyncProps {
  name: string;
}

export class MergedAPIStack extends Construct {
  constructor(scope: Construct, id: string, props: ATTAppSyncProps) {
    super(scope, id);

    // Create roles and Merged API
    const mergedAPIExecutionRole = new Role(
      this,
      `merged-api-ref-impl-role-${props.name}`,
      {
        roleName: `merged-api-ref-impl-role-${props.name}`,
        assumedBy: new ServicePrincipal('appsync.amazonaws.com'),
      }
    );
    mergedAPIExecutionRole.addToPolicy(
      new PolicyStatement({
        resources: ['*'],
        actions: ['appsync:*'],
      })
    );
    const mergedAPICloudWatchRole = new Role(
      this,
      `api-cloud-watch-role-${props.name}`,
      {
        roleName: `api-cloud-watch-role-${props.name}`,
        assumedBy: new ServicePrincipal('appsync.amazonaws.com'),
      }
    );
    mergedAPICloudWatchRole.addToPolicy(
      new PolicyStatement({
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents',
        ],
        resources: [
          `arn:aws:logs:us-east-1:807198808460:*`,
        ],
      })
    );
    
    const appSyncMergedAPI = new CfnGraphQLApi(this, id, {
      name: props.name,
      authenticationType: 'API_KEY',
      apiType: 'MERGED',
      mergedApiExecutionRoleArn: mergedAPIExecutionRole.roleArn,
    });

    // Association for PDM
    new CfnSourceApiAssociation(this, 'pdm-graphql-association', {
      // API ID is of TestProviderAPI
      sourceApiIdentifier: 'eoslzg6kh5b7ja5pk7aeqsmc7i',
      mergedApiIdentifier: appSyncMergedAPI.attrApiId,
      sourceApiAssociationConfig: {
        mergeType: 'AUTO_MERGE',
      },
    });
    // Output configs to run tests
    new CfnOutput(this, 'AppSyncAPIUrl', {
      value: appSyncMergedAPI.attrGraphQlUrl,
    });
  }
}
