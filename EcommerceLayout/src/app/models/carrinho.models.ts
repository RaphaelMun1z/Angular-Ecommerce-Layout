import { ImagemProduto } from "./catalogo.models";

export interface ItemCarrinho {
    id: string;
    nomeProduto: string;
    produtoId: string;
    quantidade: number;
    precoUnitario: number;
    subTotal: number;
    imagens: ImagemProduto[];
}

export interface Carrinho {
    id: string;
    clienteId: string;
    itens: ItemCarrinho[];
    total: number;
    dataAtualizacao: string;
}