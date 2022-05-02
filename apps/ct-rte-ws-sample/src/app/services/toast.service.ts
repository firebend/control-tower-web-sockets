import { Injectable } from '@angular/core';
import { ToastModel } from '../models/toast-model';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private _toasts: Array<ToastModel> = [];

  get toasts(): Array<ToastModel> {
    return this._toasts;
  }

  push(model: ToastModel): void {
    this._toasts.push(model);
  }

  pop(): void {
    this._toasts.pop();
  }

  clear(): void {
    this._toasts = [];
  }

  remove(model: ToastModel): void {
    this._toasts = this._toasts.filter((t) => t !== model);
  }
}
