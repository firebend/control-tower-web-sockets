
import { realTimeEventFactory } from './web-socket-client';

describe('webSocketClient', () => {
  it('should work', () => {
    expect(realTimeEventFactory('https://fake.com/events')).toBeTruthy();
  });
});
