import { getPutEvent } from "../../lib/utils/eventBusUtils"; 

export const ListProvider = function() {
  getPutEvent(
    'arn:aws:events:us-east-1:807198808460:event-bus/RTEventBus',
    'ListProviders',
    {
      eventData: {},
      requestCorrelationId: 1,
      customerId: 2,
      tenantId: 3,
    }
  );
}