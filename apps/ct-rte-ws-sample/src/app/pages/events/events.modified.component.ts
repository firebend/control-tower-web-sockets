import { Component } from '@angular/core';
import { RealTimeEventsConnectionBuilder } from '@ct-rte-ws/web-socket-client';
import { BaseEventsComponent } from './base.events.component';

@Component({
  selector: 'ct-rte-ws-events-modified',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsModifiedComponent extends BaseEventsComponent {
  override async subscribeToEvents(
    connectionBuilder: RealTimeEventsConnectionBuilder
  ): Promise<void> {
    this.title$.next('Listening only for modified events');

    connectionBuilder.on('loads', (x) => {
      x.onTrigger('Modified').withEventHandler((event) =>
        this.loadEventHandler(event, this.realTimeEvents$)
      );
    });
  }
}
