import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { IModelSateResult } from '../models/ModelStateResult';
import { RealTimeEventsConnectionBuilder } from './RealTimeEventsConnectionBuilder';

describe('RealTimeEventsConnectionBuilder', () => {
  it('should set url', () => {
    const withUrlSpy = jest.spyOn(HubConnectionBuilder.prototype, 'withUrl');

    const url = 'https://fake.com/events';

    new RealTimeEventsConnectionBuilder(url);

    expect(withUrlSpy).toHaveBeenCalledWith(url);
  });

  it('should set access token', () => {
    const withUrlSpy = jest.spyOn(HubConnectionBuilder.prototype, 'withUrl');

    const url = 'https://fake.com/events';

    new RealTimeEventsConnectionBuilder(url).withAccessToken('token');

    expect(withUrlSpy).toHaveBeenCalledWith(url, {
      accessTokenFactory: expect.any(Function),
    });
  });

  it('should start the connection and register reconnected handlers', async () => {
    const buildSpy = jest.spyOn(HubConnectionBuilder.prototype, 'build');

    const connectionMock = {
      start: jest.fn().mockResolvedValue(undefined),
      onreconnected: jest.fn(),
    } as unknown as HubConnection;

    buildSpy.mockReturnValue(connectionMock);

    const url = 'https://fake.com/events';

    await new RealTimeEventsConnectionBuilder(url)
      .withAccessToken('token')
      .startAsync();

    expect(buildSpy).toHaveBeenCalled();
    expect(connectionMock.start).toHaveBeenCalled();
    expect(connectionMock.onreconnected).toHaveBeenCalled();
  });

  it('should add event handlers for all triggers', async () => {
    const buildSpy = jest.spyOn(HubConnectionBuilder.prototype, 'build');

    const connectionMock = {
      start: jest.fn().mockResolvedValue(undefined),
      onreconnected: jest.fn(),
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
    expect(connectionMock.invoke).toHaveBeenCalledTimes(3);
    expect(connectionMock.on).toHaveBeenCalled();
  });
});
