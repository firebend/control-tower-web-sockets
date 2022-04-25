# web-socket-client

This library was generated with [Nx](https://nx.dev).

It allows clients to connected to Control Tower's Real Time Event platform. 

## Running unit tests

Run `nx test web-socket-client` to execute the unit tests via [Jest](https://jestjs.io).

## Running lint

Run `nx lint web-socket-client` to execute the lint via [ESLint](https://eslint.org/).

# Examples

## Connecting and Listening to All Events for a Given Entity

### This snippet will register an event handler for any load change.

```javascript
realTimeEventFactory('insert url')
  .withAccessToken('insert token or token promise')
  .startAsync()
  .then(builder => {
    builder.onAll('loads', event => {
      console.log('A load event triggered!', event.trigger)
    });
  });
```
## Connecting and Listening to a Specific Trigger for a Given Entity

### This snippet registers a handler to only receive modification events for the load entity.

```javascript
realTimeEventFactory('insert url')
  .withAccessToken('insert token or token promise')
  .startAsync()
  .then(builder => {
    builder.on('loads', triggers => {
      triggers
        .on('Modified')
        .withEventHandler(event => {
          console.log('A load was modified!', event.eventTime)
        })
    });
  });
```

### Connecting and Listening to a Specific Trigger With a Filter for a Given Entity

### This snippet registers a handler to receive Created triggers and Modified triggers. The modified trigger has a filter to only fire when the load status or any stop in the stop array has been altered.

```javascript
realTimeEventFactory('insert url')
  .withAccessToken('insert token or token promise')
  .startAsync()
  .then(builder => {
    builder.on('loads', triggers => {
      triggers
        .onTrigger('Created')
        .onTrigger('Modified', filters => {
          filters.withFilter('/loadStatus')
            .withFilter('/stops/*')
        })
        .withEventHandler(event => {
          console.log('A load event was triggered!', event.trigger)
        })
    });
  });
```
