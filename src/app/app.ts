import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { ListsPanelComponent } from './layout/lists-panel/lists-panel.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ListsPanelComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
