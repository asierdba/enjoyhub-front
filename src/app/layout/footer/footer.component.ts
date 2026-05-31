import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { faInstagram, faXTwitter, faTiktok } from '@fortawesome/free-brands-svg-icons';
import { ContactService } from '../../core/services/contact.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);

  year = new Date().getFullYear();
  icons = { faInstagram, faXTwitter, faTiktok };
  loading = signal(false);

  contactForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.contactForm.invalid || this.loading()) {
      return;
    } 

    this.loading.set(true);
    const { name, email, message } = this.contactForm.value;

    this.contactService.send(name!, email!, message!).subscribe({
      next: () => {
        this.loading.set(false);
        this.contactForm.reset();
        toast.success("Message sent! We'll get back to you soon.");
      },
      error: () => {
        this.loading.set(false);
        toast.error('Could not send your message. Please try again.');
      },
    });
  }
}
