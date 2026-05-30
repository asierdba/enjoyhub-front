import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  success(message: string, duration = 3500): void { this.show(message, 'success', duration); }
  error(message: string,   duration = 4000): void { this.show(message, 'error',   duration); }
  info(message: string,    duration = 3500): void { this.show(message, 'info',    duration); }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private show(message: string, type: ToastType, duration: number): void {
    const id = Date.now() + Math.random();
    this.toasts.update(list => [...list, { id, message, type }]);
    setTimeout(() => this.dismiss(id), duration);
  }
}
