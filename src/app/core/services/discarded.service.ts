import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DiscardedItem {
  contentId: number;
  userId: number;
}

@Injectable({ providedIn: 'root' })
export class DiscardedService {
  private http = inject(HttpClient);

  addToDiscarded(userId: number, contentId: number): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/users/${userId}/discarded/${contentId}`,
      {}
    );
  }

  getDiscardedByUser(userId: number): Observable<DiscardedItem[]> {
    return this.http.get<DiscardedItem[]>(`${environment.apiUrl}/users/${userId}/discarded`);
  }
}
