import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { EditProfileModalComponent } from './features/auth/edit-profile-modal/edit-profile-modal.component';
import { NgxSonnerToaster } from 'ngx-sonner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, RegisterComponent, EditProfileModalComponent, NgxSonnerToaster],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
