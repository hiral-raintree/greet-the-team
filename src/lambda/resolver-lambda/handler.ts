import { Handler } from 'aws-lambda';
import { ListProvider } from '../../service/providerService'
 
export const handler: Handler = async (event, context) => {
  ListProvider();
}