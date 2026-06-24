import { Component } from '@angular/core';
import { RealTimeEventsConnectionBuilder } from '@ct-rte-ws/web-socket-client';
import { BaseEventsComponent } from './base.events.component';

@Component({
  selector: 'ct-rte-ws-events-create',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  standalone: false,
})
export class EventsCreateComponent extends BaseEventsComponent {
  override async subscribeToEvents(
    connectionBuilder: RealTimeEventsConnectionBuilder,
  ): Promise<void> {
    this.title.set('Listening only for created events');

    connectionBuilder.on('loads', (x) => {
      x.onTrigger('Created').withEventHandler((event) =>
        this.loadEventHandler(event),
      );
    });
  }
}
