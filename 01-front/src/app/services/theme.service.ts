import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Theme {
  headerBg: string;
  usersBg: string;
  usersColor: string;
  postsBgImage: string;
  postsColor: string;
  commentsBg: string;
  commentsColor: string;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private defaultTheme: Theme = {
    headerBg: '#000',
    usersBg: '#000',
    usersColor: '#fff',
    postsBgImage: '/postsback.jpg',
    postsColor: '#fff',
    commentsBg: '#000',
    commentsColor: '#fff'
  };

  private altTheme: Theme = {
    headerBg: '#1e3aa7',
    usersBg: '#fff',
    usersColor: '#000',
    postsBgImage: '/posts-alt.jpg',
    postsColor: '#000',
    commentsBg: '#fff',
    commentsColor: '#000'
  };

  private themeSubject = new BehaviorSubject<Theme>(this.defaultTheme);
  theme$ = this.themeSubject.asObservable();

  toggleTheme() {
    const current = this.themeSubject.value;
    this.themeSubject.next(current === this.defaultTheme ? this.altTheme : this.defaultTheme);
  }
}
