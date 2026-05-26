import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faXTwitter,
  faInstagram,
  faGithub,
  faDiscord,
} from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-footer',
  imports: [FontAwesomeModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  year = new Date().getFullYear();

  socials = [
    { icon: faXTwitter,  label: 'X / Twitter', url: 'https://x.com' },
    { icon: faInstagram, label: 'Instagram',    url: 'https://instagram.com' },
    { icon: faGithub,    label: 'GitHub',        url: 'https://github.com' },
    { icon: faDiscord,   label: 'Discord',       url: 'https://discord.com' },
  ];
}
