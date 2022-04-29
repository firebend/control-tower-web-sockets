import { EventTriggerTypes } from './EventTriggerTypes';

/**
 * Encapsulates data about a given field change inside a model
 */
export interface RealTimeEventFieldChange {
  /**
   * The field path string (e.g. '/firstName' or '/address/city')
   */
  path: string;
}

/**
 * Encapsulates data about a real time event
 */
export interface RealTimeEvent<T> {
  /**
   * The event trigger
   */
  trigger: EventTriggerTypes;

  /**
   * The entity affected by the trigger
   */
  entity: T;

  /**
   * A list of field changes that occurred in the entity
   */
  fieldChanges: RealTimeEventFieldChange[];

  /**
   * The time the event changed
   */
  eventTime: string;

  /**
   * The event name
   */
  eventName: string;

  /**
   * The real time event type
   */
  eventType: string;
}
