#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
// import { LambdaStack } from '../lib/lambda-stack';
import { AppSyncStack } from '../lib/appsync-stack';

const app = new cdk.App();

// create a new Lambda
// new LambdaStack(app, 'lambdaStack');
new AppSyncStack(app, 'appSyncStack');