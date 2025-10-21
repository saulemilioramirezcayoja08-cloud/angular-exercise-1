import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Quotations } from './pages/quotations/quotations';
import { Product } from './pages/product/product';
import { Login } from './pages/login/login';
import { authGuard } from './guards/auth-guard';
import { Orders } from './pages/orders/orders';
import { QuotationList } from './pages/quotation-list/quotation-list';
import { OrderList } from './pages/order-list/order-list';
import { SaleList } from './pages/sale-list/sale-list';
import { OrderPrint } from './pages/order-print/order-print';
import { QuotationPrint } from './pages/quotation-print/quotation-print';
import { ProductCreate } from './pages/product-create/product-create';
import { Purchases } from './pages/purchases/purchases';
import { PurchaseList } from './pages/purchase-list/purchase-list';
import { CustomerCreate } from './pages/customer-create/customer-create';
import { SupplierCreate } from './pages/supplier-create/supplier-create';
import { CustomerList } from './pages/customer-list/customer-list';
import { SupplierList } from './pages/supplier-list/supplier-list';
import { ProductList } from './pages/product-list/product-list';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  { path: 'login', component: Login },

  { path: 'home', component: Home, canActivate: [authGuard] },

  { path: 'product', component: Product, canActivate: [authGuard] },
  { path: 'product-create', component: ProductCreate, canActivate: [authGuard] },
  { path: 'product-list', component: ProductList, canActivate: [authGuard] }, // NUEVO

  { path: 'customer-create', component: CustomerCreate, canActivate: [authGuard] },
  { path: 'customer-list', component: CustomerList, canActivate: [authGuard] },

  { path: 'supplier-create', component: SupplierCreate, canActivate: [authGuard] },
  { path: 'supplier-list', component: SupplierList, canActivate: [authGuard] },

  { path: 'quotation', component: Quotations, canActivate: [authGuard] },
  { path: 'quotation-list', component: QuotationList, canActivate: [authGuard] },
  { path: 'quotation/print', component: QuotationPrint, canActivate: [authGuard] },

  { path: 'order', component: Orders, canActivate: [authGuard] },
  { path: 'order-list', component: OrderList, canActivate: [authGuard] },
  { path: 'order/print', component: OrderPrint, canActivate: [authGuard] },

  { path: 'purchase', component: Purchases, canActivate: [authGuard] },
  { path: 'purchase-list', component: PurchaseList, canActivate: [authGuard] },

  { path: 'sale-list', component: SaleList, canActivate: [authGuard] },

  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
