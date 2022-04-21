import { EventTriggerTypes } from './EventTriggerTypes.js';

export interface RealTimeEventFieldChange {
  path: string;
}

export interface RealTimeEvent<T> {
  trigger: EventTriggerTypes;
  entity: T;
  fieldChanges: RealTimeEventFieldChange[];
  eventTime: string;
  eventName: string;
}
