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
        const themes: Record<string, string> = {
            // Estilo Dark (Baseado na primeira imagem)
            success: 'bg-[#1A1A1C] text-white border-[#2C2C2E] shadow-2xl shadow-black/50',
            error: 'bg-[#1A1A1C] text-white border-[#2C2C2E] shadow-2xl shadow-black/50',
            // Estilo Light (Baseado na segunda imagem)
            warning: 'bg-white text-gray-900 border-gray-100 shadow-2xl shadow-gray-200/50',
            info: 'bg-white text-gray-900 border-gray-100 shadow-2xl shadow-gray-200/50'
        };
        return themes[type] || themes['success'];
    }

    getIconBoxClasses() {
        const type = this.toastService.data().type;
        const boxes: Record<string, string> = {
            success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            error: 'bg-red-500/10 text-red-400 border-red-500/20',
            warning: 'bg-amber-50 text-amber-500 border-amber-100',
            info: 'bg-blue-50 text-blue-500 border-blue-100'
        };
        return boxes[type] || boxes['success'];
    }
    
    getIconClass() {
        const icons: Record<string, string> = {
            success: 'ph-fill ph-check-circle',
            error: 'ph-fill ph-warning-octagon',
            warning: 'ph-fill ph-warning',
            info: 'ph-fill ph-info'
        };
        return icons[this.toastService.data().type] || icons['success'];
    }
}
