import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/popup/toast/toast.component';
import { FooterV2Component } from './shared/components/layout/footer-v2/footer-v2.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, ToastComponent, FooterV2Component],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})

export class AppComponent {
    title = 'NITOR | O ponto de partida para o que você precisa';
}
