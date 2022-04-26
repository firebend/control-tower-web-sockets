import { IRealTimeConnection } from '../interfaces/IRealTimeConnection';
import { RealTimeEventBuilder } from './RealTimeEventBuilder';

describe('RealTimeEventBuilder', () => {
    let realTimeConnection: IRealTimeConnection;
    let builder: RealTimeEventBuilder;

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

      builder = new RealTimeEventBuilder('fake', realTimeConnection);
  });

  it('should add event handler', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    builder.withEventHandler(() => { })

    expect(realTimeConnection.addEventHandler).toHaveBeenCalledWith('fake', expect.any(Function));
  })

  it('should add trigger with no filter', () => {
    builder.onTrigger('Created');

    expect(builder.builders.length).toBe(1);
    expect(builder.builders[0].subscriptions.length).toBe(1);
    expect(builder.builders[0].subscriptions[0].eventName).toBe('fake');
    expect(builder.builders[0].subscriptions[0].trigger).toBe('Created');
    expect(builder.builders[0].subscriptions[0].filter).toBeUndefined();
  })

  it('should add trigger with filter', () => {
    builder.onTrigger('Modified', filters => filters.withFilter('/fake/path'))

    expect(builder.builders.length).toBe(1);
    expect(builder.builders[0].subscriptions.length).toBe(1);
    expect(builder.builders[0].subscriptions[0].eventName).toBe('fake');
    expect(builder.builders[0].subscriptions[0].trigger).toBe('Modified');
    expect(builder.builders[0].subscriptions[0].filter).toBe('/fake/path');
  })
});
