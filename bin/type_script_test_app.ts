#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TypeScriptTestAppStack } from '../lib/type_script_test_app-stack';

const app = new cdk.App();
new TypeScriptTestAppStack(app, 'TypeScriptTestAppStack');
