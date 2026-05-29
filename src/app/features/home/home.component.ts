import { Component, computed, effect, inject, signal, HostListener } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTrash, faChevronDown, faList, faCheck, faFaceMeh,
} from '@fortawesome/free-solid-svg-icons';
import { EmotionService } from '../../core/services/emotion.service';
import { ListService } from '../../core/services/list.service';
import { AuthService } from '../../core/services/auth.service';
import { DiscardedService } from '../../core/services/discarded.service';
import { RegisterModalService } from '../../core/services/register-modal.service';
import { Emotion } from '../../core/models/emotion.model';
import { Content } from '../../core/models/content.model';
import { UserList } from '../../core/models/list.model';

type StageState = 'idle' | 'loading' | 'card' | 'empty' | 'exhausted';

@Component({
  selector: 'app-home',
  imports: [FontAwesomeModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private emotionService   = inject(EmotionService);
  private listService      = inject(ListService);
  private authService      = inject(AuthService);
  private discardedService = inject(DiscardedService);
  private registerModal    = inject(RegisterModalService);

  icons = { faTrash, faChevronDown, faList, faCheck, faFaceMeh };

  // ── State ──────────────────────────────────────────────────
  emotions         = signal<Emotion[]>([]);
  selectedEmotion  = signal<Emotion | null>(null);
  contents         = signal<Content[]>([]);
  currentIndex     = signal(0);
  userLists        = signal<UserList[]>([]);
  selectedListId   = signal<number | null>(null);
  listItems        = signal<Content[]>([]);
  isDragOver       = signal(false);
  dragging         = signal(false);
  contentsLoading  = signal(false);
  discardLoading   = signal(false);
  addLoading       = signal(false);
  addSuccess       = signal(false);
  listDropdownOpen = signal(false);

  // ── Computed ───────────────────────────────────────────────
  currentUser    = this.authService.currentUser;
  isLoggedIn     = this.authService.isLoggedIn;
  currentContent = computed(() => this.contents()[this.currentIndex()] ?? null);
  selectedList   = computed(() =>
    this.userLists().find(l => l.listId === this.selectedListId()) ?? null
  );
  stageState = computed((): StageState => {
    if (!this.selectedEmotion())                              return 'idle';
    if (this.contentsLoading())                              return 'loading';
    if (this.contents().length === 0)                        return 'empty';
    if (this.currentIndex() >= this.contents().length)       return 'exhausted';
    return 'card';
  });

  constructor() {
    // Fetch emotions (max 20, random)
    this.emotionService.getEmotions().subscribe(list => {
      this.emotions.set([...list].sort(() => Math.random() - 0.5).slice(0, 20));
    });

    // React to login/logout
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.listService.getListsByUser(user.userId).subscribe(lists => {
          this.userLists.set(lists);
          if (lists.length && this.selectedListId() === null) {
            this.selectedListId.set(lists[0].listId);
          }
        });
      } else {
        this.userLists.set([]);
        this.selectedListId.set(null);
        this.listItems.set([]);
      }
    });

    // React to list selection
    effect(() => {
      const id = this.selectedListId();
      if (id) {
        this.listService.getItemsByList(id).subscribe(items => this.listItems.set(items));
      } else {
        this.listItems.set([]);
      }
    });
  }

  // ── Emotion selection ──────────────────────────────────────
  selectEmotion(emotion: Emotion): void {
    if (this.selectedEmotion()?.emotionId === emotion.emotionId) return;
    this.selectedEmotion.set(emotion);
    this.currentIndex.set(0);
    this.contents.set([]);
    this.contentsLoading.set(true);
    this.emotionService.getContentByEmotion(emotion.emotionId).subscribe({
      next: list => {
        this.contents.set([...list].sort(() => Math.random() - 0.5));
        this.contentsLoading.set(false);
      },
      error: () => this.contentsLoading.set(false),
    });
  }

  // ── Card actions ───────────────────────────────────────────
  discard(): void {
    const content = this.currentContent();
    if (!content || this.discardLoading()) return;
    this.discardLoading.set(true);
    const advance = () => { this.discardLoading.set(false); this.advance(); };
    const user = this.currentUser();
    if (user) {
      this.discardedService.addToDiscarded(user.userId, content.contentId)
        .subscribe({ next: advance, error: advance });
    } else {
      advance();
    }
  }

  // ── List selector ──────────────────────────────────────────
  selectList(id: number): void {
    this.selectedListId.set(id);
    this.listDropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.home__list-selector')) this.listDropdownOpen.set(false);
  }

  // ── Drag & drop ────────────────────────────────────────────
  onDragStart(event: DragEvent): void {
    this.dragging.set(true);
    event.dataTransfer?.setData('text/plain', 'card');
  }

  onDragEnd(): void {
    this.dragging.set(false);
    this.isDragOver.set(false);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    const related = event.relatedTarget as HTMLElement | null;
    if (!related || !(event.currentTarget as HTMLElement).contains(related)) {
      this.isDragOver.set(false);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    this.isDragOver.set(false);
    this.doAddToList();
  }

  // ── Auth ───────────────────────────────────────────────────
  openRegisterModal(): void {
    this.registerModal.open();
  }

  // ── Helpers ────────────────────────────────────────────────
  typeLabel(type: string): string {
    const map: Record<string, string> = {
      book: 'Libro', movie: 'Película', series: 'Serie', game: 'Videojuego',
    };
    return map[type] ?? type;
  }

  private doAddToList(): void {
    const listId  = this.selectedListId();
    const content = this.currentContent();
    if (!listId || !content || this.addLoading()) return;
    this.addLoading.set(true);
    this.listService.addItemToList(listId, content.contentId).subscribe({
      next: () => {
        this.listItems.update(items => [...items, content]);
        this.addLoading.set(false);
        this.addSuccess.set(true);
        setTimeout(() => this.addSuccess.set(false), 1800);
        this.advance();
      },
      error: () => this.addLoading.set(false),
    });
  }

  private advance(): void {
    this.currentIndex.update(i => i + 1);
  }
}
