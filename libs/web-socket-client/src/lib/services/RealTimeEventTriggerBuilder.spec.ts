import { IRealTimeConnection } from '../interfaces/IRealTimeConnection';
import { ISubscriptionViewModelCreate } from '../models/SubscriptionViewModelCreate';
import { RealTimeEventBuilder } from './RealTimeEventBuilder';
import { RealTimeEventTriggerBuilder } from './RealTimeEventTriggerBuilder';

describe('RealTimeEventTriggerBuilder', () => {
  let realTimeEventTriggerBuilder : RealTimeEventTriggerBuilder;
  let realTimeConnection: IRealTimeConnection;

  beforeEach(() => {
    realTimeConnection = {
        registerForEventAsync: jest.fn(),
        addEventHandler: jest.fn(),
        removeEventHandler: jest.fn(),
        onReconnected: jest.fn(),
        startAsync: jest.fn(),
        stopAsync: jest.fn(),
        unregisterForEventAsync: jest.fn(),
      };

    const realTimeEventBuilder = new RealTimeEventBuilder(
      'fake',
      realTimeConnection
    );

    realTimeEventTriggerBuilder = new RealTimeEventTriggerBuilder(realTimeEventBuilder, 'Modified');
  });

  it('should add filter', async() => {
    realTimeEventTriggerBuilder.withFilter('/fakePath');

    expect(realTimeEventTriggerBuilder.subscriptions.length).toBe(1);

    const expected = {
      trigger: 'Modified',
      eventName: 'fake',
      filter: '/fakePath'
    } as ISubscriptionViewModelCreate;

    expect(realTimeEventTriggerBuilder.subscriptions[0]).toEqual(expected);

    await realTimeEventTriggerBuilder.buildAsync();

    expect(realTimeConnection.registerForEventAsync).toHaveBeenCalledWith(expected);
  });

  it('should not add trigger with filter that has no leading slash', () => {
    expect(() => realTimeEventTriggerBuilder.withFilter('fake/path')).toThrow();
  })

  it('should not add trigger with filter on Created', () => {
    expect(() => realTimeEventTriggerBuilder.withFilter('fake/path')).toThrow();
  })

  it('should not add trigger with filter on Deleted', () => {
    expect(() => realTimeEventTriggerBuilder.withFilter('fake/path')).toThrow();
  })
});
