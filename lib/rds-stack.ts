import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { SecretValue } from 'aws-cdk-lib';
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager';

import { Construct } from 'constructs';

export class RDSStack extends Construct { 
  public readonly vpc: ec2.Vpc;
  public readonly rdsCluster: rds.ServerlessCluster;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Create the VPC needed for the Aurora Serverless DB cluster
    const vpc = new ec2.Vpc(this, 'RDSVPC');

    const dbUsername = 'master';
    const dbPassword = 'My1ProviderAuroraDatabasePassword*';
    const dbName = 'ProviderAuroraDB';

    // Create the Serverless Aurora DB cluster; set the engine to Postgres
    this.rdsCluster = new rds.ServerlessCluster(this, 'ProviderAuroraDB', {
      engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
      parameterGroup: rds.ParameterGroup.fromParameterGroupName( this, "ParameterGroup", "default.aurora-postgresql14" ),
      defaultDatabaseName: dbName,
      vpc,
      credentials: rds.Credentials.fromPassword(
        dbUsername,
        new SecretValue(dbPassword)
      ),
      scaling: { autoPause: cdk.Duration.seconds(0) } // Optional. If not set, then instance will pause after 5 minutes 
    });

    // Storing creddentials in secret manager
    const databaseCredentialsSecret = new secretsManager.Secret(
      this,
      'DatabaseCredentialsSecret',
      {
        secretName: `/rt-newgen-aurora-provider-db`,
        secretStringValue: cdk.SecretValue.unsafePlainText(
          JSON.stringify({
            rdsCluster: this.rdsCluster.clusterArn,
            engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
            username: dbUsername,
            password: dbPassword,
          })
        ),
      }
    );

    // Output the connection details
    new cdk.CfnOutput(this, 'AuroraPostgresServerlessClusterHostname', {
      value: this.rdsCluster.clusterEndpoint.hostname,
      description: 'Aurora Postgres Serverless Cluster Hostname',
    });

    // Output the Database Credentials Secret ARN
    new cdk.CfnOutput(this, 'AuroraPostgresServerlessClusterSecretARN', {
      value: databaseCredentialsSecret.secretArn,
      description: 'Aurora Postgres Serverless Cluster Secret ARN',
    });
  }
}