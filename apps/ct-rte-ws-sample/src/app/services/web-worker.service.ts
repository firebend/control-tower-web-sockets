import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { RealTimeEvent } from '@ct-rte-ws/web-socket-client';
import { filter, map } from 'rxjs';
import { IJwtMessage } from '../models/messages/jwt-message';
import { ToastModel } from '../models/toast-model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class WebWorkerService {
  private readonly _authService: AuthService;
  private readonly _toastService: ToastService;

  constructor(authService: AuthService, toastService: ToastService) {
    this._authService = authService;
    this._toastService = toastService;
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
   * Creates the worker and waits for the auth0 token to be available.
   */
  private _startWorker() {
    const worker = new Worker(new URL('../events.worker.ts', import.meta.url));

    this._authService.idTokenClaims$
      .pipe(
        map((x) => ({ token: x?.__raw ?? '' })),
        filter((x) => !!x.token)
      )
      .subscribe((x) => {
        this._addRealTimeEventListener(worker, x.token);
      });
  }

  /**
   * Posts a message to the worker with the JWT so it can subscribe to events
   * @param worker The worker to add the listener to.
   * @param token The auth0 token to use for the event listener.
   */
  private _addRealTimeEventListener(worker: Worker, token: string) {
    worker.postMessage({
      token: token,
    } as IJwtMessage);

    worker.onmessage = (event) => {
      if (event?.data) {
        const realTimeEvent = event.data as RealTimeEvent<unknown>;

        if (realTimeEvent.trigger) {
          this._handleRealTimeEvent(realTimeEvent);
        }
      }
    };
  }

  /**
   * Occurs when the web worker receives a real time event on the web socket
   * forwards the message.
   * @param realTimeEvent The event to handle.
   */
  private _handleRealTimeEvent(realTimeEvent: RealTimeEvent<unknown>) {
    console.log('Web Worker Received Real Time Event', realTimeEvent);

    this._toastService.push(
      new ToastModel({
        message: `${realTimeEvent.eventName} ${realTimeEvent.trigger}`,
        header: 'Real Time Event',
        autoHide: true,
        delay: 10_000,
        className:
          realTimeEvent.trigger == 'Created'
            ? 'bg-success text-light'
            : realTimeEvent.trigger == 'Modified'
            ? 'bg-info text-light'
            : realTimeEvent.trigger == 'Deleted'
            ? 'bg-danger text-light'
            : '',
      } as ToastModel)
    );
  }
}
