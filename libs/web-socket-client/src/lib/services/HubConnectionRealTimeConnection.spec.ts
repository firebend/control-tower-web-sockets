import { HubConnection } from '@microsoft/signalr';
import { IRealTimeConnection } from '../interfaces/IRealTimeConnection';
import { ISubscriptionViewModelCreate } from '../models/SubscriptionViewModelCreate';
import { HubConnectionRealTimeConnection } from './HubConnectionRealTimeConnection';

describe('HubConnectionRealTimeConnection', () => {
  let hubConnection: HubConnection;
  let realTimeConnection: IRealTimeConnection;

  beforeEach(() => {
    hubConnection = {
      start: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn().mockResolvedValue(undefined),
      onreconnected: jest.fn(),
      invoke: jest.fn().mockResolvedValue({}),
      on: jest.fn(),
      off: jest.fn(),
      reconnected: jest.fn()
    }as unknown as HubConnection;

    realTimeConnection = new HubConnectionRealTimeConnection(hubConnection);
  })

  it('should start', async () => {
    await realTimeConnection.startAsync();
    expect(hubConnection.start).toHaveBeenCalled();
  })

  it('should stop', async () => {
    await realTimeConnection.stopAsync();
    expect(hubConnection.stop).toHaveBeenCalled();
  })

  it('should register for events', async () => {
    const vm = {
      eventName: 'fake',
      filter: '/fake/path',
      trigger: 'Modified'
    } as ISubscriptionViewModelCreate;

    await realTimeConnection.registerForEventAsync(vm);

    expect(hubConnection.invoke).toHaveBeenCalledWith('registerForEvents', vm);
  })

  it('should unregister event subscription', async () => {
    const id = 'my-fake-sub-id-123';

    await realTimeConnection.unregisterForEventAsync(id);

    expect(hubConnection.invoke).toHaveBeenCalledWith('unregisterEventSubscription', id);
  })

  it('adds an event handler', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    realTimeConnection.addEventHandler('fake', () => {});

    expect(hubConnection.on).toHaveBeenCalledWith('fake', expect.any(Function));
  })

  it('removes an event handler', () => {
    realTimeConnection.removeEventHandler('fake');

    expect(hubConnection.off).toHaveBeenCalledWith('fake');
  })

  it('registers reconnected callback', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    realTimeConnection.onReconnected(() => {});

    expect(hubConnection.onreconnected).toHaveBeenCalledWith(expect.any(Function));
  })
});
