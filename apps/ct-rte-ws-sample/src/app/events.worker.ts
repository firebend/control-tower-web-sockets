/// <reference lib="webworker" />

import {
  RealTimeEvent,
  realTimeEventFactory,
} from '@ct-rte-ws/web-socket-client';
import { IBaseMessage } from './models/messages/base-message';
import { ConnectedMessage } from './models/messages/connected-message';
import { JwtMessage } from './models/messages/jwt-message';
import { RealTimeEventMessage } from './models/messages/real-time-event-message';

/**
 * Adds an event listener for messages.
 * When a JWT Message is sent to the worker, it will subscribe to the real time events
 * and reply back with messages when events are consumed.
 */
addEventListener('message', async (event) => {
  console.log('Worker: Message received from main script', event);

  if (!event?.data) {
    return;
  }

  const message = event.data as IBaseMessage;

  switch (message.type) {
    case 'jwt':
      // eslint-disable-next-line no-case-declarations
      const jwtMessage = message as JwtMessage;

      if (jwtMessage.token) {
        const eventBuilder = await realTimeEventFactory(
          'http://platform-qa.controltower.tech/events/signalr'
        )
          .withAccessToken(jwtMessage.token)
          .startAsync();

        postMessage(new ConnectedMessage());

        eventBuilder.onAll('loads', (realTimeEvent: RealTimeEvent<unknown>) => {
          postMessage(new RealTimeEventMessage(realTimeEvent));
        });

        console.log('Web Worker is configured to listen to real time events!');
      }
  }
});
