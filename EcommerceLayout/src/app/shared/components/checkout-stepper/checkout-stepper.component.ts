import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-checkout-stepper',
    imports: [CommonModule],
    templateUrl: './checkout-stepper.component.html',
    styleUrl: './checkout-stepper.component.css',
})
export class CheckoutStepperComponent {
    @Input() step: number = 1;

    @Input() isError: boolean = false;
}
