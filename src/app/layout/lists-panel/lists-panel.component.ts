import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faList, faLock } from '@fortawesome/free-solid-svg-icons';
import { CdkDropList, CdkDragDrop } from '@angular/cdk/drag-drop';
import { AuthService } from '../../core/services/auth.service';
import { ListService } from '../../core/services/list.service';
import { UserList } from '../../core/models/list.model';
import { Content } from '../../core/models/content.model';

@Component({
  selector: 'app-lists-panel',
  imports: [CommonModule, FontAwesomeModule, CdkDropList],
  templateUrl: './lists-panel.component.html',
  styleUrl: './lists-panel.component.scss',
})
export class ListsPanelComponent implements OnInit {
  private authService = inject(AuthService);
  private listService = inject(ListService);

  icons = { faPlus, faList, faLock };

  lists       = signal<UserList[]>([]);
  loading     = signal(false);
  newListName = signal('');
  showInput   = signal(false);

  isLoggedIn  = computed(() => this.authService.isLoggedIn());
  currentUser = computed(() => this.authService.currentUser());

  ngOnInit(): void {
    if (this.isLoggedIn()) this.loadLists();
  }

  loadLists(): void {
    const userId = this.currentUser()?.userId;
    if (!userId) return;
    this.loading.set(true);
    this.listService.getListsByUser(userId).subscribe({
      next:  lists => { this.lists.set(lists); this.loading.set(false); },
      error: ()    => this.loading.set(false),
    });
  }

  onDrop(event: CdkDragDrop<UserList[], Content[]>, listId: number): void {
    const content: Content = event.item.data;
    this.listService.addItemToList(listId, content.contentId).subscribe();
  }

  toggleInput(): void {
    this.showInput.update(v => !v);
    this.newListName.set('');
  }

  onInputChange(event: Event): void {
    this.newListName.set((event.target as HTMLInputElement).value);
  }

  createList(): void {
    const name   = this.newListName().trim();
    const userId = this.currentUser()?.userId;
    if (!name || !userId) return;
    this.listService.createList(userId, name).subscribe({
      next: list => { this.lists.update(prev => [...prev, list]); this.toggleInput(); },
    });
  }

  onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter')  this.createList();
    if (event.key === 'Escape') this.toggleInput();
  }
}
