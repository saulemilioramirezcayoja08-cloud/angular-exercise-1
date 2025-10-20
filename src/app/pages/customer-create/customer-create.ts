import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, Subject, takeUntil } from 'rxjs';
import { CustomerService } from '../../services/customer/customer-service';
import { AuthService } from '../../services/auth/auth-service';
import { Router } from '@angular/router';
import { CustomerCreateRequest } from '../../services/customer/models/customer-create-request.model';

@Component({
  selector: 'app-customer-create',
  standalone: false,
  templateUrl: './customer-create.html',
  styleUrl: './customer-create.css'
})
export class CustomerCreate implements OnInit, OnDestroy {
  customerForm!: FormGroup;
  isSubmitting = signal<boolean>(false);
  userId = signal<number | null>(null);

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.initForm();
    this.loadUserId();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.customerForm = this.fb.group({
      taxId: ['', [Validators.maxLength(40)]],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      phone: ['', [Validators.maxLength(40)]],
      email: ['', [Validators.email, Validators.maxLength(160)]],
      address: ['', [Validators.maxLength(240)]]
    });
  }

  private loadUserId(): void {
    const currentUser = this.authService.getCurrentUser();

    if (currentUser?.userId) {
      this.userId.set(currentUser.userId);
    } else {
      alert('Sesión expirada. Por favor inicie sesión nuevamente.');
      this.router.navigate(['/login']);
    }
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      this.markFormGroupTouched(this.customerForm);
      alert('Por favor, completa todos los campos requeridos correctamente');
      return;
    }

    const currentUserId = this.userId();
    if (!currentUserId) {
      alert('No se pudo obtener el ID de usuario. Por favor inicie sesión nuevamente.');
      this.router.navigate(['/login']);
      return;
    }

    const formValue = this.customerForm.value;

    const customerRequest: CustomerCreateRequest = {
      name: formValue.name.trim(),
      userId: currentUserId
    };

    if (formValue.taxId?.trim()) {
      customerRequest.taxId = formValue.taxId.trim();
    }

    if (formValue.phone?.trim()) {
      customerRequest.phone = formValue.phone.trim();
    }

    if (formValue.email?.trim()) {
      customerRequest.email = formValue.email.trim();
    }

    if (formValue.address?.trim()) {
      customerRequest.address = formValue.address.trim();
    }

    this.submitCustomer(customerRequest);
  }

  private submitCustomer(customer: CustomerCreateRequest): void {
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    this.customerService.create(customer)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            alert(response.message);
            this.resetForm();
          } else {
            alert(response.message);
          }
        },
        error: (error) => {
          console.error('Error creating customer:', error);
          this.handleApiError(error);
        }
      });
  }

  private resetForm(): void {
    this.customerForm.reset();
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private handleApiError(error: any): void {
    const message = error.error?.message || 'Error al crear el cliente';
    alert(message);
  }

  get taxId() {
    return this.customerForm.get('taxId');
  }

  get name() {
    return this.customerForm.get('name');
  }

  get phone() {
    return this.customerForm.get('phone');
  }

  get email() {
    return this.customerForm.get('email');
  }

  get address() {
    return this.customerForm.get('address');
  }
}