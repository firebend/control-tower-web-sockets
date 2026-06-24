import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

import {
  IRealTimeConnection,
  RealTimeEvent,
  realTimeEventFactory,
  RealTimeEventsConnectionBuilder,
} from '@ct-rte-ws/web-socket-client';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { filter, firstValueFrom, interval, map } from 'rxjs';
import { EventModalComponent } from '../../components/event-modal/event-modal.component';

@Component({
  selector: 'ct-rte-ws-events-base',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  standalone: false,
})
export class BaseEventsComponent implements OnInit, OnDestroy {
  private readonly _authService: AuthService;
  private readonly _modalService: NgbModal;
  private readonly _doMockEvents = false;

  private _connection: IRealTimeConnection | undefined;

  public title = signal('');
  public isLoading = signal(true);
  public error = signal<string | undefined>(undefined);

  realTimeEvents = signal<RealTimeEvent<unknown>[]>([]);

  constructor(authService: AuthService, ngbModal: NgbModal) {
    this._authService = authService;
    this._modalService = ngbModal;
  }

  async ngOnDestroy(): Promise<void> {
    await this._connection?.stopAsync();
  }

  async ngOnInit(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(undefined);
    this.title.set('Real-time Events');

    try {
      if (this._doMockEvents) {
        this.mockEvents();
      } else {
        await this._startWebSocketListener();
      }
    } catch (err) {
      this.error.set(
        err instanceof Error
          ? err.message
          : 'Failed to connect to real-time events',
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Mocks events for testing.
   */
  mockEvents() {
    interval(1_000).subscribe(() => {
      this.loadEventHandler({
        trigger: 'Created',
        entity: {
          loadNumber: '1',
        },
        eventName: 'loads',
        eventTime: new Date().toISOString(),
        fieldChanges: [],
        eventType: 'faked',
      });
    });
  }

  /**
   * Starts the real time events web socket listener and calls
   * a protected method to subscribe to the events.
   */
  private async _startWebSocketListener(): Promise<void> {
    const token = await this.getTokenAsync();

    const eventBuilder = await realTimeEventFactory(
      'https://platform-qa.controltower.tech/events/signalr',
    )
      .withAccessToken(token.token)
      .startAsync();

    this._connection = eventBuilder.connection;

    await this.subscribeToEvents(eventBuilder);
  }

  /**
   * Called after the web socket connection is opened.
   * Overriden in child classes to subscribe to events.
   * @param connectionBuilder the connection builder to subscribe to events on
   * @returns a promise
   */
  protected subscribeToEvents(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    connectionBuilder: RealTimeEventsConnectionBuilder,
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      resolve();
    });
  }

  /**
   * The event handler for when a load event is triggered
   * @param event the real time event that triggered
   */
  protected loadEventHandler(event: RealTimeEvent<unknown>) {
    console.log('Loaded event', event);
    this.realTimeEvents.update((events) => [...events, event]);
  }

  /**
   * Converts the auth0 auth service raw token to a promise
   * @returns {Promise<string>}
   */
  protected async getTokenAsync(): Promise<{ token: string }> {
    const token = await firstValueFrom(
      this._authService.getAccessTokenSilently().pipe(
        map((x) => ({ token: x ?? '' })),
        filter((x) => !!x.token),
      ),
    );

    return token;
  }

  /**
   * Gets the bootstrap class for the event
   */
  getActiveClass(event: RealTimeEvent<unknown>): string {
    switch (event.trigger) {
      case 'Created':
        return 'list-group-item-success';
      case 'Modified':
        return 'list-group-item-info';
      case 'Deleted':
        return 'list-group-item-danger';
      default:
        return '';
    }
  }

  /**
   * Opens a modal to display more information about the event.
   * @param event the event to display in the modal
   */
  openModal(event: RealTimeEvent<unknown>): void {
    const modal = this._modalService.open(EventModalComponent, {
      backdrop: false,
      scrollable: true,
      centered: true,
      size: 'xl',
    });
    modal.componentInstance.event = event;
  }
}
