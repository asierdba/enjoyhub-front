import { Component, computed, effect, inject, signal, HostListener } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTrash, faChevronDown, faList, faCheck, faFaceMeh, faHammer,
} from '@fortawesome/free-solid-svg-icons';
import { EmotionService } from '../../core/services/emotion.service';
import { ListService } from '../../core/services/list.service';
import { AuthService } from '../../core/services/auth.service';
import { DiscardedService } from '../../core/services/discarded.service';
import { RegisterModalService } from '../../core/services/register-modal.service';
import { ThemeService } from '../../core/services/theme.service';
import { Emotion } from '../../core/models/emotion.model';
import { Content } from '../../core/models/content.model';
import { UserList } from '../../core/models/list.model';

type StageState = 'loading' | 'card' | 'empty' | 'exhausted';

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
  private themeService     = inject(ThemeService);

  activeCategory = this.themeService.activeCategory;

  icons = { faTrash, faChevronDown, faList, faCheck, faFaceMeh, faHammer };

  emotions         = signal<Emotion[]>([]);
  pendingEmotion   = signal<Emotion | null>(null);
  contents         = signal<Content[]>([]);
  currentIndex     = signal(0);
  userLists        = signal<UserList[]>([]);
  selectedListId   = signal<number | null>(null);
  listItems        = signal<Content[]>([]);
  discardedIds     = signal<Set<number>>(new Set());
  isDragOver       = signal(false);
  dragging         = signal(false);
  contentsLoading  = signal(false);
  discardLoading   = signal(false);
  addLoading       = signal(false);
  addSuccess       = signal(false);
  listDropdownOpen = signal(false);

  currentUser    = this.authService.currentUser;
  isLoggedIn     = this.authService.isLoggedIn;
  currentContent = computed(() => this.contents()[this.currentIndex()] ?? null);
  selectedList   = computed(() =>
    this.userLists().find(l => l.listId === this.selectedListId()) ?? null
  );
  stageState = computed((): StageState => {
    if (this.contentsLoading())                        return 'loading';
    if (this.contents().length === 0)                  return 'empty';
    if (this.currentIndex() >= this.contents().length) return 'exhausted';
    return 'card';
  });

  constructor() {
    this.emotionService.getEmotions().subscribe(list => this.emotions.set(list));

    this.loadRandom();

    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.listService.getListsByUser(user.userId).subscribe(lists => {
          this.userLists.set(lists);
          if (lists.length && this.selectedListId() === null) {
            this.selectedListId.set(lists[0].listId);
          }
        });
        this.discardedService.getDiscardedByUser(user.userId).subscribe(items => {
          this.discardedIds.set(new Set(items.map(i => i.contentId)));
        });
      } else {
        this.userLists.set([]);
        this.selectedListId.set(null);
        this.listItems.set([]);
        this.discardedIds.set(new Set());
      }
    });

    effect(() => {
      const id = this.selectedListId();
      if (id) {
        this.listService.getItemsByList(id).subscribe(items => this.listItems.set(items));
      } else {
        this.listItems.set([]);
      }
    });
  }

  pickEmotion(emotion: Emotion): void {
    this.pendingEmotion.set(emotion);
  }

  confirmEmotion(): void {
    const emotion = this.pendingEmotion();
    if (!emotion) return;
    this.loadByEmotion(emotion);
  }

  private loadRandom(): void {
    this.currentIndex.set(0);
    this.contents.set([]);
    this.contentsLoading.set(true);
    this.emotionService.getRandomContent().subscribe({
      next: list => {
        this.contents.set(this.filterContent(list));
        this.contentsLoading.set(false);
      },
      error: () => this.contentsLoading.set(false),
    });
  }

  private loadByEmotion(emotion: Emotion): void {
    this.currentIndex.set(0);
    this.contents.set([]);
    this.contentsLoading.set(true);
    this.emotionService.getContentByEmotion(emotion.emotionId).subscribe({
      next: list => {
        this.contents.set(this.filterContent(list));
        this.contentsLoading.set(false);
      },
      error: () => this.contentsLoading.set(false),
    });
  }

  private filterContent(list: Content[]): Content[] {
    const discarded = this.discardedIds();
    const inList    = new Set(this.listItems().map(i => i.contentId));
    return [...list]
      .filter(c => !discarded.has(c.contentId) && !inList.has(c.contentId))
      .sort(() => Math.random() - 0.5);
  }

  discard(): void {
    const content = this.currentContent();
    if (!content || this.discardLoading()) return;
    this.discardLoading.set(true);
    this.discardedIds.update(s => new Set([...s, content.contentId]));
    const advance = () => { this.discardLoading.set(false); this.advance(); };
    const user = this.currentUser();
    if (user) {
      this.discardedService.addToDiscarded(user.userId, content.contentId)
        .subscribe({ next: advance, error: advance });
    } else {
      advance();
    }
  }

  selectList(id: number): void {
    this.selectedListId.set(id);
    this.listDropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.home__list-selector')) this.listDropdownOpen.set(false);
  }

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
    if (event.dataTransfer?.getData('text/plain') === 'card') {
      this.doAddToList();
    }
  }

  openRegisterModal(): void {
    this.registerModal.open();
  }

  typeLabel(type: string): string {
    const map: Record<string, string> = {
      book: 'Book', movie: 'Movie', series: 'Series', game: 'Video game',
    };
    return map[type] ?? type;
  }

  authorNames(content: Content): string {
    return content.authors?.map(a => a.authorName).join(', ') ?? '';
  }

  genreNames(content: Content): string {
    return content.genres?.map(g => g.name).join(', ') ?? '';
  }

  private doAddToList(): void {
    const listId  = this.selectedListId();
    const content = this.currentContent();
    if (!listId || !content || this.addLoading()) return;
    if (this.listItems().some(i => i.contentId === content.contentId)) return;
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
