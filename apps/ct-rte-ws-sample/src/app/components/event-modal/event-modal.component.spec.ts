import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Highlight, HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

import { EventModalComponent } from './event-modal.component';

describe('EventModalComponent', () => {
  let component: EventModalComponent;
  let fixture: ComponentFixture<EventModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EventModalComponent, Highlight],
      providers: [
        {
          provide: NgbActiveModal,
          useValue: {
            close: jest.fn(),
          },
        },
        {
          provide: HIGHLIGHT_OPTIONS,
          useValue: {
            coreLibraryLoader: () => import('highlight.js/lib/core'),
            languages: {
              json: () => import('highlight.js/lib/languages/json'),
            },
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
