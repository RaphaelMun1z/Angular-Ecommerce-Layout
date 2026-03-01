import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { CheckoutStepperComponent } from '../checkout-stepper/checkout-stepper.component';

@Component({
    selector: 'app-checkout-layout',
    imports: [RouterOutlet, CheckoutStepperComponent],
    templateUrl: './checkout-layout.component.html',
    styleUrl: './checkout-layout.component.css',
})
export class CheckoutLayoutComponent {
   private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  
  currentStep = signal(1);
  hasError = signal(false);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      let route = this.activatedRoute.root;
      while (route.firstChild) {
        route = route.firstChild;
      }
      
      const step = route.snapshot.data['step'];
      const isError = route.snapshot.data['isError'];
      
      if (step) {
          this.currentStep.set(step);
      }
      
      this.hasError.set(!!isError); 
    });
  }
}
