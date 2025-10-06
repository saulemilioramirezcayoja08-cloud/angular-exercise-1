import {Component, signal} from '@angular/core';
import {AuthService} from '../../services/auth/auth-service';
import {Router} from '@angular/router';
import {LoginRequest} from '../../services/auth/models/login-request.model';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username: string = '';
  password: string = '';
  isLoading = signal<boolean>(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  onLogin(): void {
    if (!this.username || !this.password) {
      alert('Por favor ingrese usuario y contraseña');
      return;
    }

    this.isLoading.set(true);

    const credentials: LoginRequest = {
      username: this.username,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading.set(false);

        alert(response.message);

        if (response.success) {
          this.router.navigate(['/home']);
        }
      },
      error: (error) => {
        this.isLoading.set(false);

        if (error.error?.message) {
          alert(error.error.message);
        }
        else if (error.status === 0) {
          alert('No se puede conectar con el servidor');
        }
        else {
          alert('Error de conexión con el servidor');
        }
      }
    });
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.onLogin();
  }
}
