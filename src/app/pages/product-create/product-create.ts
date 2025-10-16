import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ProductService} from '../../services/product/product-service';
import {ProductCreateRequest} from '../../services/product/models/product-create-request.model';
import {finalize, Subject, takeUntil} from 'rxjs';
import {AuthService} from '../../services/auth/auth-service';
import {Router} from '@angular/router';

interface CodeItem {
  type: string;
  code: string;
}

@Component({
  selector: 'app-product-create',
  standalone: false,
  templateUrl: './product-create.html',
  styleUrl: './product-create.css'
})
export class ProductCreate implements OnInit, OnDestroy {
  productForm!: FormGroup;
  codeForm!: FormGroup;

  isSubmitting = signal<boolean>(false);
  codes = signal<CodeItem[]>([]);
  userId = signal<number | null>(null);

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.initForms();
    this.loadUserId();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForms(): void {
    this.productForm = this.fb.group({
      sku: ['', [Validators.required, Validators.maxLength(80)]],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', Validators.maxLength(5000)],
      categoryId: [null, [Validators.min(1)]],
      uom: ['', [Validators.required, Validators.maxLength(16)]],
      price: [null, [Validators.required, Validators.min(0.01)]]
    });

    this.codeForm = this.fb.group({
      type: ['', [Validators.required, Validators.maxLength(80)]],
      code: ['', [Validators.required, Validators.maxLength(120)]]
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

  onAddCode(): void {
    if (this.codeForm.invalid) {
      this.markFormGroupTouched(this.codeForm);
      return;
    }

    const newCode: CodeItem = {
      type: this.codeForm.value.type.trim(),
      code: this.codeForm.value.code.trim()
    };

    const exists = this.codes().some(
      c => c.type === newCode.type && c.code === newCode.code
    );

    if (exists) {
      alert('Este código ya ha sido agregado');
      return;
    }

    this.codes.update(codes => [...codes, newCode]);
    this.codeForm.reset();
  }

  onRemoveCode(index: number): void {
    const code = this.codes()[index];
    const confirmDelete = confirm(
      `¿Está seguro de eliminar el código?\n\n` +
      `Tipo: ${code.type}\n` +
      `Código: ${code.code}`
    );

    if (!confirmDelete) {
      return;
    }

    this.codes.update(codes => codes.filter((_, i) => i !== index));
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      alert('Por favor, completa todos los campos requeridos');
      return;
    }

    const currentUserId = this.userId();
    if (!currentUserId) {
      alert('No se pudo obtener el ID de usuario. Por favor inicie sesión nuevamente.');
      this.router.navigate(['/login']);
      return;
    }

    const formValue = this.productForm.value;

    const productRequest: ProductCreateRequest = {
      sku: formValue.sku.trim(),
      name: formValue.name.trim(),
      uom: formValue.uom.trim(),
      price: parseFloat(formValue.price),
      userId: currentUserId
    };

    if (formValue.description?.trim()) {
      productRequest.description = formValue.description.trim();
    }

    if (formValue.categoryId && formValue.categoryId > 0) {
      productRequest.categoryId = parseInt(formValue.categoryId);
    }

    if (this.codes().length > 0) {
      productRequest.codes = this.codes().map(code => ({
        type: code.type,
        code: code.code
      }));
    }

    this.submitProduct(productRequest);
  }

  private submitProduct(product: ProductCreateRequest): void {
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    this.productService.create(product)
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
          console.error('Error creating product:', error);
          this.handleApiError(error);
        }
      });
  }

  private resetForm(): void {
    this.productForm.reset();
    this.codes.set([]);
    this.codeForm.reset();

    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private handleApiError(error: any): void {
    const message = error.error?.message || 'Error al crear el producto';
    alert(message);
  }

  get sku() {
    return this.productForm.get('sku');
  }

  get name() {
    return this.productForm.get('name');
  }

  get description() {
    return this.productForm.get('description');
  }

  get categoryId() {
    return this.productForm.get('categoryId');
  }

  get uom() {
    return this.productForm.get('uom');
  }

  get price() {
    return this.productForm.get('price');
  }
}
