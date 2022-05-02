import 'jest-preset-angular/setup-jest';

/**
 * This is a work around due to the current configuration not allowing import.meata.url to be transpiled.
 */
jest.mock('./app/services/events-worker-factory.service.ts', () => {
  return {
    EventsWorkerFactoryService: class {
      createWorker(): Worker {
        return new Worker(new URL('../events.worker.ts', ''));
      }
    },
  };
});
