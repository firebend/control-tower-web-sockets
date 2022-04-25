import { ISubscriptionViewModelCreate } from './SubscriptionViewModelCreate';

/**
 * Encapsulates information about an existing event subscription
 */
export interface ISubscriptionViewModelRead
  extends ISubscriptionViewModelCreate {
  /**
   * The id of the subscription
   */
  id: string;
}
