import { getPutEvent } from "../../lib/utils/eventBusUtils"; 

export const ListProvider = function() {
  getPutEvent(
    'arn:aws:sns:us-east-1:807198808460:Providers',
    'ListProviders',
    {
      eventData: {},
      requestCorrelationId: 1,
      customerId: 2,
      tenantId: 3,
    }
  );
}