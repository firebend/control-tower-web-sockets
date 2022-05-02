import { Component } from '@angular/core';
import { WebWorkerService } from './services/web-worker.service';

@Component({
  selector: 'ct-rte-ws-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  constructor(workerService: WebWorkerService) {
    workerService.start();
  }
}
