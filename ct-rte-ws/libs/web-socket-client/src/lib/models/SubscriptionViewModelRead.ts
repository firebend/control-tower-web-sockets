import { ISubscriptionViewModelCreate } from './SubscriptionViewModelCreate.js';

/**
 * Encapsulates information about an existing event subscription.
 */
export interface ISubscriptionViewModelRead
  extends ISubscriptionViewModelCreate {
  /**
   * The id of the subscription
   */
  id: string;
}
