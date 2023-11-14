import { Component, Input } from '@angular/core';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { delay } from 'rxjs';

@Component({
  selector: 'app-alert-box',
  templateUrl: './alert-box.component.html',
  styleUrls: ['./alert-box.component.css'],
  animations: [
	trigger('anim', [
	  transition(':enter', [
		style({ opacity: 0, transform: 'scale(0)' }),
		animate('50ms', style({ opacity: 1, transform: 'scale(1)' })),
		animate('500ms', keyframes([
		  style({ transform: 'translateX(0)', offset: 0 }),
		  style({ transform: 'translateX(-10px)', offset: 0.10 }),
		  style({ transform: 'translateY(-5px)', offset: 0.25 }),
		  style({ transform: 'translateX(10px)', offset: 0.50 }),
		  style({ transform: 'translateY(5px)', offset: 0.75 }),
		  style({ transform: 'translateX(0)', offset: 1 })
		])),
		/* delay */
		animate('1300ms', style({ opacity: 1 })),
		animate('350ms', style({ opacity: 0 })),
	  ])
	])
  ]
})
export class AlertBoxComponent {
  @Input() message: string = "";
}
