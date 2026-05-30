import { Component, effect, inject, signal, HostListener } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { faPlus, faTrash, faXmark, faLayerGroup, faPen, faHammer } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../core/services/auth.service';
import { ListService } from '../../core/services/list.service';
import { ToastService } from '../../core/services/toast.service';
import { ThemeService } from '../../core/services/theme.service';
import { UserList } from '../../core/models/list.model';
import { Content } from '../../core/models/content.model';

@Component({
  selector: 'app-dashboard',
  imports: [FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private authService  = inject(AuthService);
  private listService  = inject(ListService);
  private themeService = inject(ThemeService);
  private toast        = inject(ToastService);
  private fb           = inject(FormBuilder);

  activeCategory = this.themeService.activeCategory;
  icons = { faPlus, faTrash, faXmark, faLayerGroup, faPen, faHammer };

  lists           = signal<UserList[]>([]);
  selectedList    = signal<UserList | null>(null);
  listItems       = signal<Content[]>([]);
  selectedContent = signal<Content | null>(null);
  editingList     = signal<UserList | null>(null);

  createLoading = signal(false);
  createError   = signal<string | null>(null);
  deleteLoading = signal(false);
  editLoading   = signal(false);

  createForm = this.fb.group({
    name:        ['', Validators.required],
    description: [''],
  });

  editForm = this.fb.group({
    name:        ['', Validators.required],
    description: [''],
  });

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.loadLists(user.userId);
      } else {
        this.lists.set([]);
        this.selectedList.set(null);
        this.listItems.set([]);
      }
    });

    effect(() => {
      const list = this.selectedList();
      if (list) {
        this.loadItems(list.listId);
      } else {
        this.listItems.set([]);
      }
    });
  }

  private loadLists(userId: number): void {
    this.listService.getListsByUser(userId).subscribe({
      next: (lists) => this.lists.set(lists),
    });
  }

  private loadItems(listId: number): void {
    this.listService.getItemsByList(listId).subscribe({
      next: (items) => this.listItems.set(items),
    });
  }

  selectList(list: UserList): void {
    this.selectedList.set(list);
  }

  onCreateList(): void {
    if (this.createForm.invalid || this.createLoading()) return;
    const userId = this.authService.currentUser()?.userId;
    if (!userId) return;

    this.createLoading.set(true);
    this.createError.set(null);
    const { name, description } = this.createForm.value;

    this.listService.createList(userId, name!, description ?? undefined).subscribe({
      next: (list) => {
        this.createLoading.set(false);
        this.createForm.reset();
        this.lists.update(ls => [...ls, list]);
        this.selectedList.set(list);
        this.toast.success('List created');
      },
      error: (err) => {
        this.createLoading.set(false);
        this.toast.error(err?.error?.message ?? 'Error creating list');
      },
    });
  }

  openEditModal(list: UserList, event: MouseEvent): void {
    event.stopPropagation();
    this.editingList.set(list);
    this.editForm.patchValue({ name: list.listName, description: list.listDescription ?? '' });
  }

  closeEditModal(): void {
    this.editingList.set(null);
    this.editForm.reset();
    this.editLoading.set(false);
  }

  submitEdit(): void {
    if (this.editForm.invalid || this.editLoading()) return;
    const list = this.editingList();
    if (!list) return;

    this.editLoading.set(true);
    const { name, description } = this.editForm.value;

    this.listService.updateList(list.listId, name!, description ?? undefined).subscribe({
      next: (updated) => {
        this.editLoading.set(false);
        this.lists.update(ls => ls.map(l => l.listId === updated.listId ? updated : l));
        if (this.selectedList()?.listId === updated.listId) {
          this.selectedList.set(updated);
        }
        this.closeEditModal();
        this.toast.success('List updated');
      },
      error: () => {
        this.editLoading.set(false);
        this.toast.error('Failed to update list');
      },
    });
  }

  deleteList(): void {
    const list = this.selectedList();
    if (!list || this.deleteLoading()) return;
    this.deleteLoading.set(true);
    this.listService.deleteList(list.listId).subscribe({
      next: () => {
        this.deleteLoading.set(false);
        this.lists.update(ls => ls.filter(l => l.listId !== list.listId));
        this.selectedList.set(null);
        this.toast.success('List deleted');
      },
      error: () => {
        this.deleteLoading.set(false);
        this.toast.error('Failed to delete list');
      },
    });
  }

  removeItem(contentId: number, event: MouseEvent): void {
    event.stopPropagation();
    const listId = this.selectedList()?.listId;
    if (!listId) return;
    this.listService.deleteItemFromList(listId, contentId).subscribe({
      next: () => {
        this.listItems.update(items => items.filter(i => i.contentId !== contentId));
        this.toast.success('Item removed');
      },
    });
  }

  openContent(content: Content): void {
    this.selectedContent.set(content);
  }

  closeContent(): void {
    this.selectedContent.set(null);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selectedContent()) { this.closeContent(); return; }
    if (this.editingList())     { this.closeEditModal(); }
  }

  typeLabel(type: string): string {
    const labels: Record<string, string> = {
      book: 'Book', movie: 'Movie', series: 'Series', game: 'Video game',
    };
    return labels[type] ?? type;
  }

  authorNames(content: Content): string {
    return content.authors?.map(a => a.authorName).join(', ') ?? '';
  }

  genreNames(content: Content): string {
    return content.genres?.map(g => g.name).join(', ') ?? '';
  }
}
