import { Component, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleCheck, faCircleXmark, faCircleInfo, faXmark } from '@fortawesome/free-solid-svg-icons';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  imports: [FontAwesomeModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  private toastService = inject(ToastService);

  toasts = this.toastService.toasts;

  icons = { faCircleCheck, faCircleXmark, faCircleInfo, faXmark };

  iconFor(toast: Toast) {
    return {
      success: this.icons.faCircleCheck,
      error:   this.icons.faCircleXmark,
      info:    this.icons.faCircleInfo,
    }[toast.type];
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
