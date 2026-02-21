import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-central-search-bar',
    imports: [CommonModule, FormsModule],
    templateUrl: './central-search-bar.component.html',
    styleUrl: './central-search-bar.component.css'
})
export class CentralSearchBarComponent {
    private router = inject(Router);
    
    searchTerm = signal('');
    
    onSearch() {
        const termo = this.searchTerm().trim();
        
        this.router.navigate(['/inicio'], { 
            queryParams: termo ? { termo } : {} 
        });
    }
}
