import { realTimeEventFactory } from './web-socket-client';

describe('webSocketClient', () => {
  it('should work', () => {
    expect(realTimeEventFactory('fake')).toBeTruthy();
  });
});
