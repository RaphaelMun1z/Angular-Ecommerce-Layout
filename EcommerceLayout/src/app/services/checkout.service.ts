import { Injectable, inject } from '@angular/core';
import { PedidoService } from './pedido.service';
import { MetodoPagamento } from '../models/pedido.models';
import { Observable, switchMap, map } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CheckoutService {
    private pedidoService = inject(PedidoService);

    processarCompraCompleta(dados: {
        userId: string;
        endereco: any;
        metodoFrete: 'economic' | 'fast';
        valorFrete: number;
        metodoPagamento: MetodoPagamento;
        total: number;
    }): Observable<any> {
        return this.pedidoService.checkout(
            dados.userId,
            dados.valorFrete,
            dados.endereco.id,
            dados.metodoPagamento,
        );
    }
}
