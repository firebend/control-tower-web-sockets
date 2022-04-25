import { Component, Input } from '@angular/core';
import { RealTimeEvent } from '@ct-rte-ws/web-socket-client';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ct-rte-ws-event-modal',
  templateUrl: './event-modal.component.html',
  styleUrls: ['./event-modal.component.scss'],
})
export class EventModalComponent {
  @Input() public event: RealTimeEvent<unknown> | undefined;

  private readonly _activeModal: NgbActiveModal;

  constructor(activeModal: NgbActiveModal) {
    this._activeModal = activeModal;
  }

  close() {
    this._activeModal.close();
  }
}
