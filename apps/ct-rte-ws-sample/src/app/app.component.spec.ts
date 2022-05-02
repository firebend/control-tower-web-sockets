import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { WebWorkerService } from './services/web-worker.service';

describe('AppComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: WebWorkerService,
          useValue: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            start: () => {},
          },
        },
      ],
    });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
