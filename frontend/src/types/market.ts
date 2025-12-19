import { PaymentProvider, PaymentResponseData } from "./common";

export interface MarketPurchaseRequest {
    itemId: string;
    quantity: number;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    paymentProvider: PaymentProvider;
}

export interface MarketPurchaseResponse {
    paymentData: PaymentResponseData;
}
