import 'jest-preset-angular/setup-jest';

jest.mock('./app/services/events-worker-factory.service.ts', () => {
  return {
    EventsWorkerFactoryService: class {
      createWorker(): Worker {
        return new Worker(new URL('../events.worker.ts', ''));
      }
    },
  };
});
