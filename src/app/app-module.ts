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
import { Orders } from './pages/orders/orders';
import { TopColLeft } from './pages/orders/components/top-col-left/top-col-left';
import { BottomOrder } from './pages/orders/components/bottom-order/bottom-order';
import { MiddleOrder } from './pages/orders/components/middle-order/middle-order';
import { QuotationList } from './pages/quotation-list/quotation-list';
import { ListTop } from './pages/quotation-list/components/list-top/list-top';
import { ListMiddle } from './pages/quotation-list/components/list-middle/list-middle';
import { ListBottom } from './pages/quotation-list/components/list-bottom/list-bottom';
import { OrderList } from './pages/order-list/order-list';
import { ListBottomOrder } from './pages/order-list/components/list-bottom-order/list-bottom-order';
import { ListMiddleOrder } from './pages/order-list/components/list-middle-order/list-middle-order';
import { ListTopOrder } from './pages/order-list/components/list-top-order/list-top-order';
import { SaleList } from './pages/sale-list/sale-list';
import { ListBottomSale } from './pages/sale-list/components/list-bottom-sale/list-bottom-sale';
import { ListMiddleSale } from './pages/sale-list/components/list-middle-sale/list-middle-sale';
import { ListTopSale } from './pages/sale-list/components/list-top-sale/list-top-sale';
import { OrderPrint } from './pages/order-print/order-print';
import { QuotationPrint } from './pages/quotation-print/quotation-print';
import { ProductCreate } from './pages/product-create/product-create';
import { Purchases } from './pages/purchases/purchases';
import { MiddlePurchase } from './pages/purchases/components/middle-purchase/middle-purchase';
import { BottomPurchase } from './pages/purchases/components/bottom-purchase/bottom-purchase';
import { PurchaseList } from './pages/purchase-list/purchase-list';
import { ListTopPurchase } from './pages/purchase-list/components/list-top-purchase/list-top-purchase';
import { ListMiddlePurchase } from './pages/purchase-list/components/list-middle-purchase/list-middle-purchase';
import { ListBottomPurchase } from './pages/purchase-list/components/list-bottom-purchase/list-bottom-purchase';
import { PurchaseHistory } from './pages/product/components/purchase-history/purchase-history';
import { SaleHistory } from './pages/product/components/sale-history/sale-history';
import { StockAvailability } from './pages/product/components/stock-availability/stock-availability';
import { TopLeftPurchase } from './pages/purchases/components/top-left-purchase/top-left-purchase';
import { TopRightPurchase } from './pages/purchases/components/top-right-purchase/top-right-purchase';
import { TopColRight } from './pages/orders/components/top-col-right/top-col-right';

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
    Login,
    Orders,
    TopColLeft,
    BottomOrder,
    MiddleOrder,
    QuotationList,
    ListTop,
    ListMiddle,
    ListBottom,
    OrderList,
    ListBottomOrder,
    ListMiddleOrder,
    ListTopOrder,
    SaleList,
    ListBottomSale,
    ListMiddleSale,
    ListTopSale,
    OrderPrint,
    QuotationPrint,
    ProductCreate,
    Purchases,
    MiddlePurchase,
    BottomPurchase,
    PurchaseList,
    ListTopPurchase,
    ListMiddlePurchase,
    ListBottomPurchase,
    PurchaseHistory,
    SaleHistory,
    StockAvailability,
    TopLeftPurchase,
    TopRightPurchase,
    TopColRight
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
