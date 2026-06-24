import { Component } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'ct-rte-ws-toasts',
  templateUrl: './toasts.component.html',
  styleUrls: ['./toasts.component.scss'],
  host: {
    class: 'toast-container position-fixed top-0 end-0 p-3',
    style: 'z-index: 1200',
  },
  standalone: false,
})
export class ToastsComponent {
  toastService: ToastService;

  constructor(toastService: ToastService) {
    this.toastService = toastService;
  }
}
