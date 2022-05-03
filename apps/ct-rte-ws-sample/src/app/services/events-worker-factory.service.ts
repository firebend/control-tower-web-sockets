import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EventsWorkerFactoryService {
  createWorker(): Worker {
    const worker = new Worker(new URL('../events.worker.ts', import.meta.url));
    return worker;
  }
}
