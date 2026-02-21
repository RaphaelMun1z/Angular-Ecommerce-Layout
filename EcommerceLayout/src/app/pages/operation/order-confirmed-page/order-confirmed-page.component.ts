import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, Renderer2, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

declare var confetti: any;

@Component({
    selector: 'app-order-confirmed-page',
    imports: [CommonModule, RouterLink],
    templateUrl: './order-confirmed-page.component.html',
    styleUrl: './order-confirmed-page.component.css',
})
export class OrderConfirmedPageComponent implements OnInit {
    @Input() id?: string;

    private authService = inject(AuthService);
    private renderer = inject(Renderer2);

    userName = signal<string>('Cliente');
    pedidoId = signal<string>('');

    ngOnInit() {
        this.loadConfettiScript();

        const user = this.authService.currentUser();
        if (user && user.name) {
            const firstName = user.name.split(' ')[0];
            this.userName.set(firstName);
        }

        if (this.id) {
            this.pedidoId.set(this.id.substring(0, 8).toUpperCase());
        }
    }

    loadConfettiScript() {
        if (document.getElementById('confetti-script')) {
            this.triggerConfetti();
            return;
        }

        const script = this.renderer.createElement('script');
        script.id = 'confetti-script';
        script.src =
            'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
        script.onload = () => {
            this.triggerConfetti();
        };
        this.renderer.appendChild(document.body, script);
    }

    triggerConfetti() {
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10B981', '#34D399', '#FBBF24', '#ffffff'],
            });

            setTimeout(() => {
                this.fireSideConfetti();
            }, 300);
        }
    }

    fireSideConfetti() {
        const end = Date.now() + 2 * 1000;
        const colors = ['#10B981', '#ffffff'];

        (function frame() {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors,
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors,
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        })();
    }
}
