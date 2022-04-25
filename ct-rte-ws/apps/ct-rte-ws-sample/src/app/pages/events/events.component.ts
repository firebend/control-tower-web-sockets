import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

import {
  RealTimeEvent,
  realTimeEventFactory,
} from '@ct-rte-ws/web-socket-client';
import { BehaviorSubject, filter, firstValueFrom, map } from 'rxjs';

@Component({
  selector: 'ct-rte-ws-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {
  private readonly _authService: AuthService;
  realTimeEvents$ = new BehaviorSubject<RealTimeEvent<unknown>[]>([]);

  constructor(authService: AuthService) {
    this._authService = authService;
  }

  ngOnInit(): void {
    this.registerForEvents()
      .then(() => {
        console.log('Registered for events');
      })
      .catch((err) => console.error(err));
  }

  /**
   * Registers for all load events
   */
  async registerForEvents(): Promise<void> {
    const token = await this.getTokenAsync();

    const eventBuilder = await realTimeEventFactory(
      'http://localhost:5216/events'
    )
      .withAccessToken(token.token)
      .startAsync();

    eventBuilder.onAll('loads', (event) =>
      this.loadEventHandler(event, this.realTimeEvents$)
    );
  }

  /**
   * The event handler for when a load event is triggered
   * @param event the real time event that triggered
   * @param sub the behavior subject to push the event onto a list so that the front end updates
   */
  loadEventHandler(
    event: RealTimeEvent<unknown>,
    sub: BehaviorSubject<RealTimeEvent<unknown>[]>
  ) {
    console.log('Loaded event', event);
    sub.next([...sub.getValue(), ...[event]]);
  }

  /**
   * Converts the auth0 auth service raw token to a promise
   * @returns {Promise<string>}
   */
  async getTokenAsync(): Promise<{ token: string }> {
    const token = await firstValueFrom(
      this._authService.idTokenClaims$.pipe(
        map((x) => ({ token: x?.__raw ?? '' })),
        filter((x) => !!x.token)
      )
    );

    return token;
  }
}
