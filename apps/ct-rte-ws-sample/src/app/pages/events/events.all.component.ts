import { Component } from '@angular/core';
import { RealTimeEventsConnectionBuilder } from '@ct-rte-ws/web-socket-client';
import { BaseEventsComponent } from './base.events.component';

@Component({
  selector: 'ct-rte-ws-events-all',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsAllComponent extends BaseEventsComponent {
    override async subscribeToEvents(connectionBuilder : RealTimeEventsConnectionBuilder): Promise<void> {

    this.title$.next('Listening for all events');

    connectionBuilder.onAll('loads', (event) =>
      this.loadEventHandler(event, this.realTimeEvents$)
    );
  }
}
