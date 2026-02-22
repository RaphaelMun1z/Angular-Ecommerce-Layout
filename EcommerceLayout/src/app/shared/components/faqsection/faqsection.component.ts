import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FaqItem } from '../../interfaces/FaqItem';

@Component({
    selector: 'app-faqsection',
    imports: [CommonModule],
    templateUrl: './faqsection.component.html',
    styleUrl: './faqsection.component.css',
})
export class FAQSectionComponent {
    faqs: FaqItem[] = [
        {
            question: 'Quais métodos de pagamento vocês aceitam?',
            answer: 'Aceitamos cartões de crédito (Visa, Mastercard, Elo, Amex), Pix com aprovação imediata, boleto bancário e parcelamento em até 12x sem juros, dependendo do valor da compra.',
            isOpen: false,
        },
        {
            question: 'Quanto tempo demora para o produto ser enviado?',
            answer: 'Após a confirmação do pagamento, os produtos são despachados em até 24 horas úteis. O tempo de entrega final varia conforme o seu CEP e a modalidade de frete escolhida no momento da compra.',
            isOpen: false,
        },
        {
            question: 'Vocês fazem envio internacional?',
            answer: 'Sim, oferecemos envio internacional para mais de 100 países. As taxas de envio e os prazos de entrega variam dependendo do destino. Você pode calcular os custos na etapa de finalização da compra antes do pagamento.',
            isOpen: true, // Deixamos o terceiro aberto por padrão, como no seu modelo
        },
        {
            question: 'Como faço para rastrear o meu pedido?',
            answer: 'Assim que o seu pedido for faturado e enviado, você receberá um e-mail com o código de rastreamento e um link direto para acompanhar a entrega no site da transportadora parceira.',
            isOpen: false,
        },
        {
            question: 'Qual é a política de devolução e troca?',
            answer: 'Você tem até 7 dias corridos após o recebimento para solicitar a devolução ou troca do produto por arrependimento, desde que ele esteja na embalagem original, sem sinais de uso e com os lacres intactos.',
            isOpen: false,
        },
    ];

    toggleFaq(index: number): void {
        this.faqs.forEach((faq, i) => {
            if (i !== index) faq.isOpen = false;
        });

        this.faqs[index].isOpen = !this.faqs[index].isOpen;
    }
}
