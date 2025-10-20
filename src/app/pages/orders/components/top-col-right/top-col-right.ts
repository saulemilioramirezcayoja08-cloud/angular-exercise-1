import { Component, Input } from '@angular/core';
import { CustomerData } from '../../../../services/order/order-state';

@Component({
  selector: 'app-top-col-right',
  standalone: false,
  templateUrl: './top-col-right.html',
  styleUrl: './top-col-right.css'
})
export class TopColRight {
  @Input() customer: CustomerData | null = null;
}