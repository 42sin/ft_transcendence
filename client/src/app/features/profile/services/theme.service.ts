import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor() { }

  setTheme(theme: string) {
    if (theme === 'yellow') {
      document.documentElement.style.setProperty('--primary', 'var(--space-yellow)');
      document.documentElement.style.setProperty('--accent', 'var(--space-yellow-accent)');
      document.documentElement.style.setProperty('--primary-light', 'var(--space-yellow-light)');
      document.documentElement.style.setProperty('--primary-dark', 'var(--space-yellow-dark)');
      document.documentElement.style.setProperty('--gradient', 'var(--space-yellow-gradient)');
      document.documentElement.style.setProperty('--font-color', 'black');
    } else if (theme === 'blue') {
      document.documentElement.style.setProperty('--primary', 'var(--space-blue)');
      document.documentElement.style.setProperty('--accent', 'var(--space-blue-accent)');
      document.documentElement.style.setProperty('--primary-light', 'var(--space-blue-light)');
      document.documentElement.style.setProperty('--primary-dark', 'var(--space-blue-dark)');
      document.documentElement.style.setProperty('--gradient', 'var(--space-blue-gradient)');
      document.documentElement.style.setProperty('--font-color', 'var(--foreground)');
    } else if (theme === 'pink') {
      document.documentElement.style.setProperty('--primary', 'var(--space-pink)');
      document.documentElement.style.setProperty('--accent', 'var(--space-pink-accent)');
      document.documentElement.style.setProperty('--primary-light', 'var(--space-pink-light)');
      document.documentElement.style.setProperty('--primary-dark', 'var(--space-pink-dark)');
      document.documentElement.style.setProperty('--gradient', 'var(--space-pink-gradient)');
      document.documentElement.style.setProperty('--font-color', 'var(--foreground)');
    }
  }
}

