import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReportType } from '../../../shared/interfaces/ReportType';
import { ToastrService } from 'ngx-toastr';
import { AnaliticoService } from '../../../services/analitico.service';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
    selector: 'app-administrative-reports-page',
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './administrative-reports-page.component.html',
    styleUrl: './administrative-reports-page.component.css'
})

export class AdministrativeReportsPageComponent {
    private analiticoService = inject(AnaliticoService);
    private toastr = inject(ToastrService);
    
    activeCategory = signal<'Todos' | 'Vendas' | 'Estoque' | 'Clientes' | 'Financeiro'>('Todos');
    loadingReportId = signal<string | null>(null);
    
    reports = signal<ReportType[]>([
        {
            id: 'sales-period',
            title: 'Relatório de Vendas',
            description: 'Lista completa de pedidos, status e valores para o período selecionado.',
            icon: 'ph-chart-line-up',
            category: 'Vendas',
            colorClass: 'text-green-600 bg-green-50',
            selectedPeriod: 'month'
        },
        {
            id: 'inventory-status',
            title: 'Posição de Estoque',
            description: 'Inventário atual com quantidades, preços de custo e valor total em mercadoria.',
            icon: 'ph-package',
            category: 'Estoque',
            colorClass: 'text-brand-600 bg-brand-50',
            selectedPeriod: 'today'
        },
        {
            id: 'customer-list',
            title: 'Base de Clientes',
            description: 'Dados de contato e métricas de compra de todos os clientes cadastrados.',
            icon: 'ph-users-three',
            category: 'Clientes',
            colorClass: 'text-blue-600 bg-blue-50',
            selectedPeriod: 'year'
        },
        {
            id: 'financial-summary',
            title: 'Balanço Financeiro',
            description: 'Resumo de receitas, métodos de pagamento mais utilizados e taxa de conversão.',
            icon: 'ph-currency-dollar',
            category: 'Financeiro',
            colorClass: 'text-purple-600 bg-purple-50',
            selectedPeriod: 'month'
        }
    ]);
    
    filteredReports = computed(() => {
        const category = this.activeCategory();
        if (category === 'Todos') return this.reports();
        return this.reports().filter(r => r.category === category);
    });
    
    setCategory(cat: any) {
        this.activeCategory.set(cat);
    }
    
    generateReport(report: ReportType) {
        this.loadingReportId.set(report.id);
        
        const { inicio, fim } = this.calculateDates(report.selectedPeriod);
        
        if (report.category === 'Vendas') {
            this.analiticoService.baixarRelatorioVendas(inicio, fim).subscribe({
                next: (blob) => this.processarCsvParaPdf(blob, report.title),
                error: (err) => {
                    console.error('Erro ao baixar relatório:', err);
                    this.handleError();
                },
                complete: () => this.loadingReportId.set(null)
            });
        } else if (report.category === 'Estoque') {
            this.analiticoService.baixarRelatorioEstoque().subscribe({
                next: (blob) => this.processarCsvParaPdf(blob, report.title),
                error: () => this.handleError(),
                complete: () => this.loadingReportId.set(null)
            });
        } else {
            setTimeout(() => {
                this.toastr.info('Este relatório está sendo preparado.', 'Em breve');
                this.loadingReportId.set(null);
            }, 1000);
        }
    }
    
    private processarCsvParaPdf(blob: Blob, reportTitle: string) {
        const reader = new FileReader();
        
        reader.onload = (e: any) => {
            const csvText = e.target.result;
            if (!csvText) {
                this.toastr.error('O relatório retornou vazio.');
                return;
            }
            
            const lines = csvText.split(/\r?\n/).filter((l: string) => l.trim().length > 0);
            const delimiter = csvText.includes(';') ? ';' : ',';
            
            const data = lines.map((line: string) => line.split(delimiter));
            const headers = data[0];
            const body = data.slice(1);
            
            this.gerarTabelaPdf(headers, body, reportTitle);
        };
        
        reader.readAsText(blob);
    }
    
    private gerarTabelaPdf(headers: string[], body: any[][], title: string) {
        const doc = new jsPDF('l', 'mm', 'a4');
        const dateStr = new Date().toLocaleString('pt-BR');
        
        doc.setFontSize(18);
        doc.text(title, 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Gerado em: ${dateStr}`, 14, 28);
        doc.text('Ecommerce - Painel Administrativo', 14, 34);
        
        autoTable(doc, {
            head: [headers],
            body: body,
            startY: 40,
            theme: 'striped',
            headStyles: { 
                fillColor: [15, 23, 42],
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold'
            },
            styles: { 
                fontSize: 8,
                cellPadding: 3
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252]
            },
            margin: { top: 40 },
            didDrawPage: (data) => {
                const str = 'Página ' + doc.getNumberOfPages();
                doc.setFontSize(8);
                const pageSize = doc.internal.pageSize;
                const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
                doc.text(str, data.settings.margin.left, pageHeight - 10);
            }
        });
        
        const fileName = `${title.toLowerCase().replace(/ /g, '-')}-${new Date().getTime()}.pdf`;
        doc.save(fileName);
        this.toastr.success('Relatório PDF gerado com sucesso!');
    }
    
    private calculateDates(period: string): { inicio: string, fim: string } {
        const now = new Date();
        let start = new Date();
        
        switch (period) {
            case 'today': 
            break;
            case 'week': 
            start.setDate(now.getDate() - 7); 
            break;
            case 'month': 
            start.setDate(1);
            break;
            case 'year': 
            start.setMonth(0, 1);
            break;
            default: 
            start.setDate(1);
        }
        
        return {
            inicio: this.formatToLocalDate(start),
            fim: this.formatToLocalDate(now)
        };
    }
    
    private formatToLocalDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }
    
    private handleError() {
        this.toastr.error('Erro ao processar os dados. Tente novamente.');
        this.loadingReportId.set(null);
    }
}
