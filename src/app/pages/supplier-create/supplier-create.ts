import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, Subject, takeUntil } from 'rxjs';
import { SupplierService } from '../../services/supplier/supplier-service';
import { AuthService } from '../../services/auth/auth-service';
import { Router } from '@angular/router';
import { SupplierCreateRequest } from '../../services/supplier/models/supplier-create-request.model';

@Component({
  selector: 'app-supplier-create',
  standalone: false,
  templateUrl: './supplier-create.html',
  styleUrl: './supplier-create.css'
})
export class SupplierCreate implements OnInit, OnDestroy {
  supplierForm!: FormGroup;
  isSubmitting = signal<boolean>(false);
  userId = signal<number | null>(null);

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
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
    this.supplierForm = this.fb.group({
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
    if (this.supplierForm.invalid) {
      this.markFormGroupTouched(this.supplierForm);
      alert('Por favor, completa todos los campos requeridos correctamente');
      return;
    }

    const currentUserId = this.userId();
    if (!currentUserId) {
      alert('No se pudo obtener el ID de usuario. Por favor inicie sesión nuevamente.');
      this.router.navigate(['/login']);
      return;
    }

    const formValue = this.supplierForm.value;

    const supplierRequest: SupplierCreateRequest = {
      name: formValue.name.trim(),
      userId: currentUserId
    };

    if (formValue.taxId?.trim()) {
      supplierRequest.taxId = formValue.taxId.trim();
    }

    if (formValue.phone?.trim()) {
      supplierRequest.phone = formValue.phone.trim();
    }

    if (formValue.email?.trim()) {
      supplierRequest.email = formValue.email.trim();
    }

    if (formValue.address?.trim()) {
      supplierRequest.address = formValue.address.trim();
    }

    this.submitSupplier(supplierRequest);
  }

  private submitSupplier(supplier: SupplierCreateRequest): void {
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    this.supplierService.create(supplier)
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
          console.error('Error creating supplier:', error);
          this.handleApiError(error);
        }
      });
  }

  private resetForm(): void {
    this.supplierForm.reset();
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private handleApiError(error: any): void {
    const message = error.error?.message || 'Error al crear el proveedor';
    alert(message);
  }

  get taxId() {
    return this.supplierForm.get('taxId');
  }

  get name() {
    return this.supplierForm.get('name');
  }

  get phone() {
    return this.supplierForm.get('phone');
  }

  get email() {
    return this.supplierForm.get('email');
  }

  get address() {
    return this.supplierForm.get('address');
  }
}