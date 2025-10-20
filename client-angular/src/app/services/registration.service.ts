// src/app/services/registration.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface RegistrationItem {
  id: number;
  event_id: number;
  user_name: string;
  contact_email: string;
  num_tickets: number;
  registration_date: string;
  notes?: string;
}

// 优先使用环境变量，未配置时回退本地
const API_BASE = (environment as any)?.apiBase || 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  constructor(private http: HttpClient) {}

  /** 提交报名 */
  create(payload: {
    event_id: number;
    user_name: string;
    contact_email: string;
    num_tickets: number;
    notes?: string;
  }): Observable<any> {
    return this.http.post(`${API_BASE}/registrations`, payload);
  }

  /**
   * 获取某活动的全部报名列表（自动兼容两种后端返回形态）：
   * 1) 纯数组： RegistrationItem[]
   * 2) 分页对象： { registrations: RegistrationItem[], ... }
   */
  getByEvent(eventId: number): Observable<RegistrationItem[]> {
    const params = new HttpParams().set('event_id', String(eventId));

    return this.http
      .get<any>(`${API_BASE}/registrations`, { params })
      .pipe(
        map(resp => {
          let list: RegistrationItem[] = [];
          if (Array.isArray(resp)) {
            list = resp as RegistrationItem[];
          } else if (resp && Array.isArray(resp.registrations)) {
            list = resp.registrations as RegistrationItem[];
          }
          // 保险：再次按 event_id 过滤，避免后端未过滤的情况
          return list.filter(r => Number(r.event_id) === Number(eventId));
        })
      );
  }
}
