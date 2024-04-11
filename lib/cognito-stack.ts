import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import {
  AccountRecovery,
  IUserPool,
  UserPool,
  UserPoolClient,
} from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

interface UserPoolProps {
  userPoolName: string;
  signInCaseSensitive: boolean;
  domainPrefix: string;
}

export class RTProviderServiceCognitoUserPool extends Construct {
  public readonly userPool: IUserPool;
  public readonly userPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string, props: UserPoolProps) {
    super(scope, id);
    this.userPool = this.createUserPool(id, props);
    this.userPoolClient = this.userPool.addClient('app-client', {
      userPoolClientName: 'login-app-client',
      generateSecret: false,
    });
  }

  private createUserPool(id: string, props: UserPoolProps): IUserPool {
    // Setup the cognito settings based on the requirement
    const userPool = new UserPool(this, id, {
      userPoolName: props.userPoolName,
      signInCaseSensitive: props.signInCaseSensitive,
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: { email: true },
      standardAttributes: {
        email: {
          required: true,
          mutable: false,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
        tempPasswordValidity: Duration.days(3),
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
    });

    userPool.applyRemovalPolicy(RemovalPolicy.DESTROY);

    // Setup domain
    userPool.addDomain('cognito-domain', {
      cognitoDomain: { domainPrefix: props.domainPrefix },
    });

    return userPool;
  }
}
