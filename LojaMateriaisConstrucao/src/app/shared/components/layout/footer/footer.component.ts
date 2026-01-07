import { Component, Input } from '@angular/core';
import { BRAND_CONFIG } from '../../../mocks/BRAND_CONFIG';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-footer',
    imports: [CommonModule, RouterLink],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.css'
})

export class FooterComponent {
    config = BRAND_CONFIG;
    
    @Input() color: 'dark' | 'light' = 'light';
    
    get fullName(): string {
        return `${this.config.namePrefix}${this.config.nameSuffix}`;
    }
}
