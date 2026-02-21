export enum TipoMovimentacao {
    ENTRADA = 'ENTRADA',
    SAIDA = 'SAIDA'
}

export interface MovimentacaoEstoque {
    id: string;
    produtoId: string;
    nomeProduto: string;
    quantidade: number;
    tipo: TipoMovimentacao;
    motivo?: string;
    pedidoId?: string;
    dataMovimentacao: string;
}

export interface MovimentacaoEstoqueRequest {
    produtoId: string;
    quantidade: number;
    tipo: TipoMovimentacao;
    motivo: string;
}