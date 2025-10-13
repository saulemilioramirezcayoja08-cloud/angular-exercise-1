import { afterNextRender, Component, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('exercise_1');
  protected isLoginPage = signal(false);
  protected isReady = signal(false);

  constructor(private router: Router) {
    afterNextRender(() => {
      this.isReady.set(true);
    });
  }

  ngOnInit(): void {
    this.checkIfLoginPage(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.checkIfLoginPage(event.url);
      });
  }

  private checkIfLoginPage(url: string): void {
    const urlPath = url.split('?')[0].split('#')[0];

    const hideNavbarRoutes = [
      '/login',
      '/order/print',
      '/quotation/print',
      '/sale/print'
    ];

    const shouldHideNavbar = urlPath === '/' || hideNavbarRoutes.some(route =>
      urlPath === route || urlPath.startsWith(route + '/')
    );

    this.isLoginPage.set(shouldHideNavbar);
  }
}