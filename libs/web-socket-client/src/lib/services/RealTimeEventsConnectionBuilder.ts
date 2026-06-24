import {
  HubConnectionBuilder,
  HttpTransportType,
  IHttpConnectionOptions,
} from '@microsoft/signalr';
import { IRealTimeConnection } from '../interfaces/IRealTimeConnection';
import { RealTimeEvent } from '../models/RealTimeEvent';
import { HubConnectionRealTimeConnection } from './HubConnectionRealTimeConnection';
import { RealTimeEventBuilder } from './RealTimeEventBuilder';
import IsValidUrl from './UrlValidator';

export type AccessTokenFactory = () => string | Promise<string>;

export class RealTimeEventsConnectionBuilder {
  private readonly _hubConnectionBuilder: HubConnectionBuilder;
  private readonly _url;
  private _tokenFactory: AccessTokenFactory | null = null;
  private _reconnectDelays: number[] = [0, 2000, 10000, 30000, 60000];
  private _keepAliveInterval = 10000;
  private _serverTimeout = 30000;
  private _transport =
    HttpTransportType.WebSockets | HttpTransportType.LongPolling;
  private _closeHandler?: (error?: Error) => void;
  private _connection!: IRealTimeConnection;
  private _builders: RealTimeEventBuilder[] = [];

  get connection(): IRealTimeConnection {
    return this._connection;
  }

  /**
   * Create a new instance.
   * @param url the url to Control Tower Platform Real Time Events Web Socket Module.
   */
  constructor(url: string) {
    if (!IsValidUrl(url)) {
      throw 'A valid url is required';
    }

    this._url = url;
    this._hubConnectionBuilder = new HubConnectionBuilder();
  }

  /**
   * Assigns the access token or a factory that returns a token.
   * @param token a string, a promise that returns a string, or a factory that returns either. Factories are re-invoked on reconnect so a fresh token can be fetched.
   * @returns RealTimeEventsConnectionBuilder
   */
  withAccessToken(
    token: string | Promise<string> | AccessTokenFactory,
  ): RealTimeEventsConnectionBuilder {
    if (typeof token === 'function') {
      this._tokenFactory = token as AccessTokenFactory;
    } else {
      this._tokenFactory = () => token;
    }
    return this;
  }

  /**
   * Configures the reconnect delays used by SignalR when the connection drops.
   * @param delays the delays in milliseconds
   * @returns RealTimeEventsConnectionBuilder
   */
  withAutomaticReconnect(delays: number[]): RealTimeEventsConnectionBuilder {
    this._reconnectDelays = delays;
    return this;
  }

  /**
   * Configures the keep alive interval.
   * @param ms the interval in milliseconds
   * @returns RealTimeEventsConnectionBuilder
   */
  withKeepAliveInterval(ms: number): RealTimeEventsConnectionBuilder {
    this._keepAliveInterval = ms;
    return this;
  }

  /**
   * Configures the server timeout.
   * @param ms the timeout in milliseconds
   * @returns RealTimeEventsConnectionBuilder
   */
  withServerTimeout(ms: number): RealTimeEventsConnectionBuilder {
    this._serverTimeout = ms;
    return this;
  }

  /**
   * Configures the transport(s) to use.
   * @param transport the SignalR transport(s)
   * @returns RealTimeEventsConnectionBuilder
   */
  withTransport(transport: HttpTransportType): RealTimeEventsConnectionBuilder {
    this._transport = transport;
    return this;
  }

  /**
   * Configures a callback for when the connection is permanently closed.
   * @param handler the close handler
   * @returns RealTimeEventsConnectionBuilder
   */
  withCloseHandler(
    handler: (error?: Error) => void,
  ): RealTimeEventsConnectionBuilder {
    this._closeHandler = handler;
    return this;
  }

  /**
   * Starts the web socket connection
   * @returns RealTimeEventsConnectionBuilder
   */
  async startAsync(): Promise<RealTimeEventsConnectionBuilder> {
    const urlOptions: IHttpConnectionOptions = {
      transport: this._transport,
    };

    if (this._tokenFactory) {
      urlOptions.accessTokenFactory = this._tokenFactory;
    }

    this._connection = new HubConnectionRealTimeConnection(
      this._hubConnectionBuilder
        .withUrl(this._url, urlOptions)
        .withAutomaticReconnect(this._reconnectDelays)
        .withKeepAliveInterval(this._keepAliveInterval)
        .withServerTimeout(this._serverTimeout)
        .build(),
    );

    await this._connection.startAsync();

    this._connection.onReconnected(() => this._onReconnectedHandler());
    this._connection.onClose((error) => this._onConnectionClosed(error));

    return this;
  }

  private async _onReconnectedHandler() {
    for (let i = 0; i < this._builders.length; i++) {
      await this._builders[i].buildAsync();
    }
  }

  private _onConnectionClosed(error?: Error) {
    if (this._closeHandler) {
      this._closeHandler(error);
      return;
    }

    // eslint-disable-next-line no-console
    console.error(
      'The real-time events connection was closed and will not reconnect.',
      error,
    );
  }

  /**
   * Start listening for events with a given name.
   * @param eventName the name of the event
   * @param configure an callback handler to configure event triggers and filters
   * @returns RealTimeEventsConnectionBuilder
   */
  on(
    eventName: string,
    configure: (builder: RealTimeEventBuilder) => void,
  ): RealTimeEventsConnectionBuilder {
    if (!this._connection) {
      throw 'A connection is required to register event handlers. Call startAsync() first.';
    }

    const builder = new RealTimeEventBuilder(eventName, this._connection);

    configure(builder);

    this._builders.push(builder);

    builder.buildAsync().catch((e) => {
      // eslint-disable-next-line no-console
      console.error(`Failed to register for event '${eventName}'`, e);
    });

    return this;
  }

  /**
   * Registers an event handler for all event triggers for a given name.
   * @param eventName The name of the event
   * @param callback The callback to be invoked when the event is received
   * @returns RealTimeEventsConnectionBuilder
   */
  onAll<T>(
    eventName: string,
    callback: (event: RealTimeEvent<T>) => void,
  ): RealTimeEventsConnectionBuilder {
    return this.on(eventName, (builder) =>
      builder
        .onTrigger('Created')
        .onTrigger('Modified')
        .onTrigger('Deleted')
        .withEventHandler(callback),
    );
  }
}
