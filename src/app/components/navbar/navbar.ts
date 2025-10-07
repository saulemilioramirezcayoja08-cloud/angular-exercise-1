import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth/auth-service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  activeDropdown: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
  }

  toggleDropdown(section: string): void {
    this.activeDropdown = this.activeDropdown === section ? null : section;
  }

  closeDropdowns(): void {
    this.activeDropdown = null;
  }

  onLogout(): void {
    const confirmLogout = confirm('¿Está seguro que desea cerrar sesión?');

    if (confirmLogout) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
