import { TestBed } from '@angular/core/testing';
import { AuthService } from '@auth0/auth0-angular';
import { of } from 'rxjs';
import { EventsWorkerFactoryService } from './events-worker-factory.service';
import { ToastService } from './toast.service';

import { WebWorkerService } from './web-worker.service';

describe('WebWorkerService', () => {
  let service: WebWorkerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            idTokenClaims$: of(''),
          },
        },
        {
          provide: EventsWorkerFactoryService,
        },
        {
          provide: ToastService,
        },
      ],
    });
    service = TestBed.inject(WebWorkerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
