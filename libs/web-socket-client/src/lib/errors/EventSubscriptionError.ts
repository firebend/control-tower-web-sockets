import { IModelError } from '../models/ModelStateResult';

export class EventSubscriptionError extends Error {

  constructor(errors: IModelError[] = []) {
    super('An error occurred while subscribing to an event');
    this.errors = errors;
  }

  public readonly errors : IModelError[] = [];
}
