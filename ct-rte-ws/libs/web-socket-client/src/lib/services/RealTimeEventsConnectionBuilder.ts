import { HubConnectionBuilder } from '@microsoft/signalr';
import { IRealTimeConnection } from '../interfaces/IRealTimeConnection';
import { RealTimeEvent } from '../models/RealTimeEvent';
import { HubConnectionRealTimeConnection } from './HubConnectionRealTimeConnection';
import { RealTimeEventBuilder } from './RealTimeEventBuilder';

export class RealTimeEventsConnectionBuilder {
  private readonly _hubConnectionBuilder: HubConnectionBuilder;
  private readonly _url;
  private _connection!: IRealTimeConnection;

  get connection(): IRealTimeConnection {
    return this._connection;
  }

  constructor(url: string) {
    if (!url) {
      throw 'A url is required';
    }

    this._url = url;

    this._hubConnectionBuilder = new HubConnectionBuilder()
      .withUrl(this._url)
      .withAutomaticReconnect();
  }

  withAccessToken(
    token: Promise<string> | string
  ): RealTimeEventsConnectionBuilder {
    this._hubConnectionBuilder.withUrl(this._url, {
      accessTokenFactory: () => token,
    });

    return this;
  }

  async startAsync(): Promise<RealTimeEventsConnectionBuilder> {
    this._connection = new HubConnectionRealTimeConnection(
      this._hubConnectionBuilder.build()
    );

    await this._connection.startAsync();

    return this;
  }

  on(
    eventName: string,
    configure: (builder: RealTimeEventBuilder) => void
  ): RealTimeEventsConnectionBuilder {
    const builder = new RealTimeEventBuilder(eventName, this._connection);

    configure(builder);

    builder.buildAsync().then(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {}
    );

    return this;
  }

  onAll<T>(
    eventName: string,
    callback: (event: RealTimeEvent<T>) => void
  ): RealTimeEventsConnectionBuilder {
    return this.on(eventName, builder =>
      builder.onTrigger('Created', trigger => trigger.withFilter(undefined))
    )
      .on(eventName, builder =>
        builder.onTrigger('Modified', trigger => trigger.withFilter(undefined))
      )
      .on(eventName, builder =>
        builder.onTrigger('Deleted', trigger => trigger.withFilter(undefined))
      )
      .on(eventName, builder => builder.withEventHandler(callback));
  }
}
