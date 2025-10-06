import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  activeDropdown: string | null = null;

  toggleDropdown(section: string) {
    this.activeDropdown = this.activeDropdown === section ? null : section;
  }

  closeDropdowns() {
    this.activeDropdown = null;
  }
}
