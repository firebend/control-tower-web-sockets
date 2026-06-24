import {
  HubConnection,
  HubConnectionBuilder,
  HttpTransportType,
} from '@microsoft/signalr';
import { IModelSateResult } from '../models/ModelStateResult';
import { RealTimeEventsConnectionBuilder } from './RealTimeEventsConnectionBuilder';

function createBuilderSpies() {
  return {
    withUrlSpy: jest.spyOn(HubConnectionBuilder.prototype, 'withUrl'),
    withAutomaticReconnectSpy: jest.spyOn(
      HubConnectionBuilder.prototype,
      'withAutomaticReconnect',
    ),
    withKeepAliveIntervalSpy: jest.spyOn(
      HubConnectionBuilder.prototype,
      'withKeepAliveInterval',
    ),
    withServerTimeoutSpy: jest.spyOn(
      HubConnectionBuilder.prototype,
      'withServerTimeout',
    ),
    buildSpy: jest.spyOn(HubConnectionBuilder.prototype, 'build'),
  };
}

function createConnectionMock() {
  return {
    start: jest.fn().mockResolvedValue(undefined),
    onreconnected: jest.fn(),
    onclose: jest.fn(),
  } as unknown as HubConnection;
}

describe('RealTimeEventsConnectionBuilder', () => {
  it('should require a valid url', () => {
    expect(() => new RealTimeEventsConnectionBuilder('not-a-url')).toThrow();
  });

  it('should apply default SignalR options', async () => {
    const spies = createBuilderSpies();
    const connectionMock = createConnectionMock();
    spies.buildSpy.mockReturnValue(connectionMock);

    const url = 'https://fake.com/events';

    await new RealTimeEventsConnectionBuilder(url)
      .withAccessToken('token')
      .startAsync();

    expect(spies.withUrlSpy).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        accessTokenFactory: expect.any(Function),
        transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
      }),
    );
    expect(spies.withAutomaticReconnectSpy).toHaveBeenCalledWith([
      0, 2000, 10000, 30000, 60000,
    ]);
    expect(spies.withKeepAliveIntervalSpy).toHaveBeenCalledWith(10000);
    expect(spies.withServerTimeoutSpy).toHaveBeenCalledWith(30000);
    expect(connectionMock.start).toHaveBeenCalled();
    expect(connectionMock.onreconnected).toHaveBeenCalled();
    expect(connectionMock.onclose).toHaveBeenCalled();

    Object.values(spies).forEach((spy) => spy.mockRestore());
  });

  it('should allow custom SignalR options', async () => {
    const spies = createBuilderSpies();
    const connectionMock = createConnectionMock();
    spies.buildSpy.mockReturnValue(connectionMock);

    const url = 'https://fake.com/events';
    const customCloseHandler = jest.fn();

    await new RealTimeEventsConnectionBuilder(url)
      .withAccessToken('token')
      .withAutomaticReconnect([0, 1000])
      .withKeepAliveInterval(5000)
      .withServerTimeout(15000)
      .withTransport(HttpTransportType.LongPolling)
      .withCloseHandler(customCloseHandler)
      .startAsync();

    expect(spies.withAutomaticReconnectSpy).toHaveBeenCalledWith([0, 1000]);
    expect(spies.withKeepAliveIntervalSpy).toHaveBeenCalledWith(5000);
    expect(spies.withServerTimeoutSpy).toHaveBeenCalledWith(15000);
    expect(spies.withUrlSpy).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        transport: HttpTransportType.LongPolling,
      }),
    );

    const closeCallback = (connectionMock.onclose as jest.Mock).mock
      .calls[0][0];
    const error = new Error('connection lost');
    closeCallback(error);

    expect(customCloseHandler).toHaveBeenCalledWith(error);

    Object.values(spies).forEach((spy) => spy.mockRestore());
  });

  it('should start the connection without an access token', async () => {
    const spies = createBuilderSpies();
    const connectionMock = createConnectionMock();
    spies.buildSpy.mockReturnValue(connectionMock);

    const url = 'https://fake.com/events';

    await new RealTimeEventsConnectionBuilder(url).startAsync();

    expect(spies.withUrlSpy).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
      }),
    );
    expect(connectionMock.start).toHaveBeenCalled();
    expect(connectionMock.onreconnected).toHaveBeenCalled();
    expect(connectionMock.onclose).toHaveBeenCalled();

    Object.values(spies).forEach((spy) => spy.mockRestore());
  });

  it('should wrap a string token in a factory', async () => {
    const spies = createBuilderSpies();
    const connectionMock = createConnectionMock();
    spies.buildSpy.mockReturnValue(connectionMock);

    const url = 'https://fake.com/events';

    await new RealTimeEventsConnectionBuilder(url)
      .withAccessToken('string-token')
      .startAsync();

    const urlOptions = spies.withUrlSpy.mock.calls[0][1] as {
      accessTokenFactory: () => string | Promise<string>;
    };

    const token = await urlOptions.accessTokenFactory();
    expect(token).toBe('string-token');

    Object.values(spies).forEach((spy) => spy.mockRestore());
  });

  it('should wrap a promise token in a factory', async () => {
    const spies = createBuilderSpies();
    const connectionMock = createConnectionMock();
    spies.buildSpy.mockReturnValue(connectionMock);

    const url = 'https://fake.com/events';

    await new RealTimeEventsConnectionBuilder(url)
      .withAccessToken(Promise.resolve('promise-token'))
      .startAsync();

    const urlOptions = spies.withUrlSpy.mock.calls[0][1] as {
      accessTokenFactory: () => string | Promise<string>;
    };

    const token = await urlOptions.accessTokenFactory();
    expect(token).toBe('promise-token');

    Object.values(spies).forEach((spy) => spy.mockRestore());
  });

  it('should accept a token factory and re-invoke it each time', async () => {
    const spies = createBuilderSpies();
    const connectionMock = createConnectionMock();
    spies.buildSpy.mockReturnValue(connectionMock);

    const url = 'https://fake.com/events';
    const factory = jest.fn().mockReturnValue('fresh-token');

    await new RealTimeEventsConnectionBuilder(url)
      .withAccessToken(factory)
      .startAsync();

    const urlOptions = spies.withUrlSpy.mock.calls[0][1] as {
      accessTokenFactory: () => string | Promise<string>;
    };

    const token1 = await urlOptions.accessTokenFactory();
    const token2 = await urlOptions.accessTokenFactory();

    expect(token1).toBe('fresh-token');
    expect(token2).toBe('fresh-token');
    expect(factory).toHaveBeenCalledTimes(2);

    Object.values(spies).forEach((spy) => spy.mockRestore());
  });

  it('should add event handlers for all triggers', async () => {
    const buildSpy = jest.spyOn(HubConnectionBuilder.prototype, 'build');

    const connectionMock = {
      start: jest.fn().mockResolvedValue(undefined),
      onreconnected: jest.fn(),
      onclose: jest.fn(),
      on: jest.fn(),
      invoke: jest.fn().mockResolvedValue({
        wasSuccessful: true,
      } as IModelSateResult<unknown>),
    } as unknown as HubConnection;

    buildSpy.mockReturnValue(connectionMock);

    const url = 'https://fake.com/events';

    const builder = await new RealTimeEventsConnectionBuilder(url)
      .withAccessToken('token')
      .startAsync();

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    builder.onAll('fake', () => {});

    await new Promise((res) => setTimeout(res, 100));

    expect(buildSpy).toHaveBeenCalled();
    expect(connectionMock.start).toHaveBeenCalled();
    expect(connectionMock.onreconnected).toHaveBeenCalled();
    expect(connectionMock.onclose).toHaveBeenCalled();
    expect(connectionMock.invoke).toHaveBeenCalledTimes(3);
    expect(connectionMock.on).toHaveBeenCalled();

    buildSpy.mockRestore();
  });

  it('should re-register subscriptions after reconnect using the correct this context', async () => {
    const buildSpy = jest.spyOn(HubConnectionBuilder.prototype, 'build');

    let reconnectedCallback: (() => void) | undefined;

    const connectionMock = {
      start: jest.fn().mockResolvedValue(undefined),
      onreconnected: jest.fn((callback: () => void) => {
        reconnectedCallback = callback;
      }),
      onclose: jest.fn(),
      on: jest.fn(),
      invoke: jest.fn().mockResolvedValue({
        wasSuccessful: true,
      } as IModelSateResult<unknown>),
    } as unknown as HubConnection;

    buildSpy.mockReturnValue(connectionMock);

    const url = 'https://fake.com/events';

    const builder = await new RealTimeEventsConnectionBuilder(url)
      .withAccessToken('token')
      .startAsync();

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    builder.onAll('fake', () => {});

    await new Promise((res) => setTimeout(res, 100));

    expect(connectionMock.invoke).toHaveBeenCalledTimes(3);

    expect(reconnectedCallback).toBeDefined();

    if (!reconnectedCallback) {
      throw new Error('reconnected callback was not registered');
    }

    await reconnectedCallback();

    expect(connectionMock.invoke).toHaveBeenCalledTimes(6);

    buildSpy.mockRestore();
  });
});
