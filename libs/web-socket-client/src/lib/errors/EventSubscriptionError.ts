import { IModelError } from '../models/ModelStateResult';

/**
 * Encapsulates data for an event subscription error.
 */
export class EventSubscriptionError extends Error {

  /**
   * Creates a new instance.
   * @param errors The errors that ocurred during the event subscription.
   */
  constructor(errors: IModelError[] = []) {
    super('An error occurred while subscribing to an event');
    this.errors = errors;
  }

  /**
   * The errors that ocurred during the event subscription.
   */
  public readonly errors : IModelError[] = [];
}
