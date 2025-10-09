import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {Home} from './pages/home/home';
import {Quotations} from './pages/quotations/quotations';
import {Product} from './pages/product/product';
import {Login} from './pages/login/login';
import {authGuard} from './guards/auth-guard';
import { Orders } from './pages/orders/orders';
import { QuotationList } from './pages/quotation-list/quotation-list';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  { path: 'login', component: Login },

  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'product', component: Product, canActivate: [authGuard] },
  { path: 'quotation', component: Quotations, canActivate: [authGuard] },
  { path: 'quotation-list', component: QuotationList, canActivate: [authGuard] },
  { path: 'order', component: Orders, canActivate: [authGuard] },

  { path: '**', redirectTo: '/login' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
