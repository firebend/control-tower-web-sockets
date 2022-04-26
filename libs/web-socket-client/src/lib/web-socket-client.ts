import { RealTimeEventsConnectionBuilder } from './services/RealTimeEventsConnectionBuilder';

export function realTimeEventFactory(url: string): RealTimeEventsConnectionBuilder {
  return new RealTimeEventsConnectionBuilder(url);
}
