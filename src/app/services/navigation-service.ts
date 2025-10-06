import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private returnUrl: string = '/';

  setReturnUrl(url: string): void {
    this.returnUrl = url;
  }

  navigateBack(router: Router): void {
    router.navigate([this.returnUrl]);
  }
}
