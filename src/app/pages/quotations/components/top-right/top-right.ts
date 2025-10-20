import {Component, Input} from '@angular/core';
import { CustomerData } from '../../../../services/quotation/quotation-state';

@Component({
  selector: 'app-top-right',
  standalone: false,
  templateUrl: './top-right.html',
  styleUrl: './top-right.css'
})
export class TopRight {
  @Input() customer: CustomerData | null = null;
}