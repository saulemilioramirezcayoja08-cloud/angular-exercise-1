import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-top-left-purchase',
  standalone: false,
  templateUrl: './top-left-purchase.html',
  styleUrl: './top-left-purchase.css'
})
export class TopLeftPurchase implements OnInit, OnDestroy{
  currentDate: string = '';
  currentTime: string = '';

  private intervalId: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.updateDateTime();

    this.intervalId = setInterval(() => {
      this.updateDateTime();
      this.cdr.detectChanges();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private updateDateTime(): void {
    const now = new Date();

    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const dayName = days[now.getDay()];
    const day = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();

    this.currentDate = `${dayName}, ${day} de ${monthName} de ${year}`;

    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const period = hours >= 12 ? 'p. m.' : 'a. m.';

    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = hours.toString().padStart(2, '0');

    this.currentTime = `${hoursStr}:${minutes}:${seconds} ${period}`;
  }
}
