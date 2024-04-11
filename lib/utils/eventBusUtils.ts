import { PutEventsRequestEntry } from 'aws-sdk/clients/eventbridge';

export const getPutEvent = (
  eventBusName: string,
  detailType: string, 
  detail: { [key: string]: any }
): PutEventsRequestEntry => {
  return {
    EventBusName: eventBusName,
    Detail: JSON.stringify(detail), 
    DetailType: detailType,
    Source: 'platform-delivery-model',
  };
};
