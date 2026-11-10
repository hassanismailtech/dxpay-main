// No fulfillment endpoints exist in the backend. Do not expose a simulated
// status mutation as a successful server operation.
export const fulfillmentApi = {
  updateOrderStatus: async (): Promise<never> => {
    throw new Error('Fulfillment status updates are not connected.');
  },
};
