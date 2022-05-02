import { TemplateRef } from '@angular/core';

export class ToastModel {
  message: string | TemplateRef<unknown>;
  className: string;
  delay: number | undefined;
  header: string;
  autoHide: boolean;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(options: ToastModel){
    this.autoHide = options.autoHide;
    this.message = options.message || '';
    this.className= options.className ||'';
    this.delay =  options.autoHide ? (options.delay || 5000) : undefined;
    this.header = options.header || 'Alert!'
  }

  get isTemplateReference() {
    return this.message instanceof TemplateRef;
  }

  get messageAsTemplateReference(){
    return this.message as TemplateRef<unknown>;
  }
}
