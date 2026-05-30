import { Component, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCloudArrowDown, faUsers, faEnvelope, faXmark, faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { AdminService, AdminUser, ContactMessage, ImportResult } from '../../core/services/admin.service';

type AdminTab = 'import' | 'users' | 'messages';

@Component({
  selector: 'app-admin',
  imports: [FontAwesomeModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  private adminService = inject(AdminService);

  icons = { faCloudArrowDown, faUsers, faEnvelope, faXmark, faTrash };

  activeTab = signal<AdminTab>('import');

  importing    = signal(false);
  importResult = signal<ImportResult | null>(null);
  importError  = signal<string | null>(null);

  users        = signal<AdminUser[]>([]);
  usersLoading = signal(false);

  messages        = signal<ContactMessage[]>([]);
  messagesLoading = signal(false);

  selectedUser   = signal<AdminUser | null>(null);
  editUserName   = signal('');
  editEmail      = signal('');
  editRole       = signal<string>('user');
  editLoading    = signal(false);
  editError      = signal<string | null>(null);
  deletingListId = signal<number | null>(null);

  selectedMessage = signal<ContactMessage | null>(null);

  setTab(tab: AdminTab): void {
    this.activeTab.set(tab);
    if (tab === 'users'    && this.users().length === 0)    this.loadUsers();
    if (tab === 'messages' && this.messages().length === 0) this.loadMessages();
  }

  importBooks(): void {
    this.importing.set(true);
    this.importResult.set(null);
    this.importError.set(null);
    this.adminService.importBooks().subscribe({
      next: res => { this.importing.set(false); this.importResult.set(res); },
      error: ()  => { this.importing.set(false); this.importError.set('Import failed. Please try again.'); },
    });
  }

  openUserModal(user: AdminUser): void {
    this.selectedUser.set({ ...user });
    this.editUserName.set(user.userName);
    this.editEmail.set(user.email);
    this.editRole.set(user.role);
    this.editError.set(null);
  }

  closeUserModal(): void {
    this.selectedUser.set(null);
    this.editLoading.set(false);
    this.editError.set(null);
  }

  saveUser(): void {
    const user = this.selectedUser();
    if (!user || this.editLoading()) return;
    this.editLoading.set(true);
    this.editError.set(null);
    this.adminService.updateUser(user.userId, {
      userName: this.editUserName(),
      email:    this.editEmail(),
      role:     this.editRole(),
    }).subscribe({
      next: updated => {
        this.users.update(list => list.map(u => u.userId === updated.userId ? updated : u));
        this.editLoading.set(false);
        this.closeUserModal();
      },
      error: () => {
        this.editLoading.set(false);
        this.editError.set('Failed to update user. Please try again.');
      },
    });
  }

  deleteList(listId: number): void {
    if (this.deletingListId() !== null) return;
    this.deletingListId.set(listId);
    this.adminService.deleteList(listId).subscribe({
      next: () => {
        const user = this.selectedUser();
        if (user) {
          const updated = { ...user, lists: user.lists.filter(l => l.listId !== listId) };
          this.selectedUser.set(updated);
          this.users.update(list => list.map(u => u.userId === user.userId ? updated : u));
        }
        this.deletingListId.set(null);
      },
      error: () => this.deletingListId.set(null),
    });
  }

  openMessageModal(msg: ContactMessage): void {
    this.selectedMessage.set(msg);
  }

  closeMessageModal(): void {
    this.selectedMessage.set(null);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selectedMessage()) { this.closeMessageModal(); return; }
    if (this.selectedUser())    { this.closeUserModal(); }
  }

  private loadUsers(): void {
    this.usersLoading.set(true);
    this.adminService.getUsers().subscribe({
      next: u  => { this.users.set(u); this.usersLoading.set(false); },
      error: () => this.usersLoading.set(false),
    });
  }

  private loadMessages(): void {
    this.messagesLoading.set(true);
    this.adminService.getContactMessages().subscribe({
      next: m  => { this.messages.set(m); this.messagesLoading.set(false); },
      error: () => this.messagesLoading.set(false),
    });
  }
}
