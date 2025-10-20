import { Component, Input } from '@angular/core';
import { SupplierData } from '../../../../services/purchase/purchase-state';

@Component({
  selector: 'app-top-right-purchase',
  standalone: false,
  templateUrl: './top-right-purchase.html',
  styleUrl: './top-right-purchase.css'
})
export class TopRightPurchase {
  @Input() supplier: SupplierData | null = null;
}