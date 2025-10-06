import { NgModule, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Home } from './pages/home/home';
import { Quotations } from './pages/quotations/quotations';
import { Navbar } from './components/navbar/navbar';
import { HttpClientModule } from "@angular/common/http";
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { Product } from './pages/product/product';
import { LeftMiddle } from './pages/product/components/left-middle/left-middle';
import { LeftTop } from './pages/product/components/left-top/left-top';
import { TopRight } from './pages/quotations/components/top-right/top-right';
import { Bottom } from './pages/quotations/components/bottom/bottom';
import { TopLeft } from './pages/quotations/components/top-left/top-left';
import { Middle } from './pages/quotations/components/middle/middle';
import { Login } from './pages/login/login';

@NgModule({
  declarations: [
    App,
    Home,
    Quotations,
    Navbar,
    Product,
    LeftMiddle,
    LeftTop,
    TopRight,
    Bottom,
    TopLeft,
    Middle,
    Login
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideClientHydration(withEventReplay())
  ],
  bootstrap: [App]
})
export class AppModule { }
