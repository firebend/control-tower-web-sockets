import { HubConnectionBuilder } from '@microsoft/signalr';
import { IRealTimeConnection } from '../interfaces/IRealTimeConnection';
import { RealTimeEvent } from '../models/RealTimeEvent';
import { HubConnectionRealTimeConnection } from './HubConnectionRealTimeConnection';
import { RealTimeEventBuilder } from './RealTimeEventBuilder';
import IsValidUrl from './UrlValidator';

export class RealTimeEventsConnectionBuilder {
  private readonly _hubConnectionBuilder: HubConnectionBuilder;
  private readonly _url;
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

    this._hubConnectionBuilder = new HubConnectionBuilder()
      .withUrl(this._url)
      .withAutomaticReconnect();
  }

  /**
   * Assigns the access token.
   * @param token a promise that returns a string or a string that contains the JWT token for authorization
   * @returns RealTimeEventsConnectionBuilder
   */
  withAccessToken(
    token: Promise<string> | string
  ): RealTimeEventsConnectionBuilder {
    this._hubConnectionBuilder.withUrl(this._url, {
      accessTokenFactory: () => token,
    });

    return this;
  }

  /**
   * Starts the web socket connection
   * @returns RealTimeEventsConnectionBuilder
   */
  async startAsync(): Promise<RealTimeEventsConnectionBuilder> {
    this._connection = new HubConnectionRealTimeConnection(
      this._hubConnectionBuilder.build()
    );

    await this._connection.startAsync();

    this._connection.onReconnected(this._onReconnectedHandler);

    return this;
  }

  private async _onReconnectedHandler(){
    for (let i = 0; i < this._builders.length; i++) {
      await this._builders[i].buildAsync();
    }
  }

  /**
   * Start listening for events with a given name.
   * @param eventName the name of the event
   * @param configure an callback handler to configure event triggers and filters
   * @returns RealTimeEventsConnectionBuilder
   */
  on(
    eventName: string,
    configure: (builder: RealTimeEventBuilder) => void
  ): RealTimeEventsConnectionBuilder {
    const builder = new RealTimeEventBuilder(eventName, this._connection);

    configure(builder);

    this._builders.push(builder);

    builder.buildAsync().then(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {}
    );

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
    callback: (event: RealTimeEvent<T>) => void
  ): RealTimeEventsConnectionBuilder {
    return this.on(eventName, builder =>
      builder.onTrigger('Created').onTrigger('Modified').onTrigger('Deleted').withEventHandler(callback)
    )
  }
}
