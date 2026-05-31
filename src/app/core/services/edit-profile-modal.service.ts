import { Injectable, signal } from '@angular/core';

export type EditProfileMode = 'profile' | 'password';

@Injectable({ providedIn: 'root' })
export class EditProfileModalService {
  mode = signal<EditProfileMode | null>(null);

  openProfile(): void { this.mode.set('profile');  }
  openPassword(): void { this.mode.set('password'); }
  close(): void { this.mode.set(null);        }
}
