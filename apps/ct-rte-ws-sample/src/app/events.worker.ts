/// <reference lib="webworker" />

import {
  RealTimeEvent,
  realTimeEventFactory,
} from '@ct-rte-ws/web-socket-client';
import { IJwtMessage } from './models/messages/jwt-message';

/**
 * Adds an event listener for messages.
 * When a JWT Message is sent to the worker, it will subscribe to the real time events
 * and reply back with messages when events are consumed.
 */
addEventListener('message', async (event) => {
  console.log('Worker: Message received from main script', event);
  const jwt = event.data as IJwtMessage;

  if (jwt && jwt.token) {
    const eventBuilder = await realTimeEventFactory(
      'http://localhost:5216/events'
    )
      .withAccessToken(jwt.token)
      .startAsync();

    eventBuilder.onAll('loads', (realTimeEvent: RealTimeEvent<unknown>) => {
      postMessage(realTimeEvent);
    });

    console.log('Web Worker is configured to listen to real time events!');
  }
});
