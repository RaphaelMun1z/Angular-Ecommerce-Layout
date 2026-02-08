import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
    selector: 'app-order-failed-page',
    imports: [CommonModule, RouterLink],
    templateUrl: './order-failed-page.component.html',
    styleUrl: './order-failed-page.component.css',
})
export class OrderFailedPageComponent implements OnInit {
    private authService = inject(AuthService);

    userName = signal<string>('Cliente');

    ngOnInit() {
        const user = this.authService.currentUser();
        if (user && user.name) {
            const firstName = user.name.split(' ')[0];
            this.userName.set(firstName);
        }
    }
}
