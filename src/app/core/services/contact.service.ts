import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);

  send(name: string, email: string, message: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/contact`,{ name, email, message });
  }
}
