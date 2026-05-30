import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { ListsPanelComponent } from './layout/lists-panel/lists-panel.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { EditProfileModalComponent } from './features/auth/edit-profile-modal/edit-profile-modal.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ListsPanelComponent, RegisterComponent, EditProfileModalComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
