import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { filter, map } from 'rxjs';
import { IBaseMessage } from '../models/messages/base-message';
import { ConnectedMessage } from '../models/messages/connected-message';
import { JwtMessage } from '../models/messages/jwt-message';
import { RealTimeEventMessage } from '../models/messages/real-time-event-message';
import { ToastModel } from '../models/toast-model';
import { EventsWorkerFactoryService } from './events-worker-factory.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class WebWorkerService {
  private readonly _authService: AuthService;
  private readonly _toastService: ToastService;
  private readonly _workerFactory: EventsWorkerFactoryService;

  constructor(
    authService: AuthService,
    toastService: ToastService,
    workerFactory: EventsWorkerFactoryService
  ) {
    this._authService = authService;
    this._toastService = toastService;
    this._workerFactory = workerFactory;
  }

  start() {
    if (typeof Worker !== 'undefined') {
      this._startWorker();
    } else {
      this._toastService.push(
        new ToastModel({
          message: 'Web workers are not supported in this environment.',
          className: 'bg-danger text-light',
        } as ToastModel)
      );
    }
  }

  /**
   * Waits for a token to be available and then creates the worker.
   */
  private _startWorker() {
    this._authService.idTokenClaims$
      .pipe(
        map((x) => ({ token: x?.__raw ?? '' })),
        filter((x) => !!x.token)
      )
      .subscribe((x) => {
        this.initializeWorker(x.token);
      });
  }

  /**
   * Posts a message to the worker with the JWT so it can subscribe to events.
   * Message handlers are registered for messages sent from the web worker.
   * @param token The token to use for the event listener.
   */
  private initializeWorker(token: string) {
    const worker = this._workerFactory.createWorker();

    worker.postMessage(new JwtMessage(token));

    worker.onmessage = (event) => {
      if (event?.data) {
        const baseMessage = event.data as IBaseMessage;

        switch (baseMessage.type) {
          case 'connected':
            this._onConnected();
            break;
          case 'real-time-event':
            this._handleRealTimeEvent(event.data as RealTimeEventMessage);
            break;
        }
      }
    };
  }

  /**
   * Handles a message from the web worker that we are in fact connected to the real time events service.
   * @param _connected the message
   */
  private _onConnected() {
    this._toastService.push(
      new ToastModel({
        header: 'Connected!',
        message:
          'The web worker is connected to the real time event service! Any events received will be displayed in the console and here as toasts!',
        className: 'bg-success text-light',
      } as ToastModel)
    );
  }

  /**
   * Occurs when the web worker receives a real time event on the web socket
   * forwards the message.
   * @param realTimeEvent The event to handle.
   */
  private _handleRealTimeEvent(realTimeEvent: RealTimeEventMessage) {
    console.log('Web Worker Received Real Time Event', realTimeEvent);

    this._toastService.push(
      new ToastModel({
        message: `${realTimeEvent.event.eventName} ${realTimeEvent.event.trigger}`,
        header: 'Real Time Event',
        autoHide: true,
        delay: 10_000,
        className:
          realTimeEvent.event.trigger == 'Created'
            ? 'bg-success text-light'
            : realTimeEvent.event.trigger == 'Modified'
            ? 'bg-info text-light'
            : realTimeEvent.event.trigger == 'Deleted'
            ? 'bg-danger text-light'
            : '',
      } as ToastModel)
    );
  }
}
