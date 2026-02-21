import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastService } from '../../../../services/toast.service';

@Component({
    selector: 'app-toast',
    imports: [CommonModule],
    templateUrl: './toast.component.html',
    styleUrl: './toast.component.css'
})
export class ToastComponent {
    public toastService = inject(ToastService);
    
    getThemeClasses() {
        const type = this.toastService.data().type;
        const themes = {
            success: 'bg-gray-900 text-white border-gray-700 shadow-brand-500/10',
            error: 'bg-red-600 text-white border-red-500 shadow-red-500/20',
            warning: 'bg-amber-500 text-white border-amber-400 shadow-amber-500/20',
            info: 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20'
        };
        return themes[type] || themes.success;
    }
    
    getIconClass() {
        const icons = {
            success: 'ph-fill ph-check-circle',
            error: 'ph-fill ph-warning-octagon',
            warning: 'ph-fill ph-warning',
            info: 'ph-fill ph-info'
        };
        return icons[this.toastService.data().type] || icons.success;
    }
}
