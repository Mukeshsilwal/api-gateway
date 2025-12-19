export type PaymentProvider = "ESEWA" | "KHALTI";

export interface PaymentData {
    payment_url: string;
}

export interface BaseResponse<T> {
    data: T;
    message?: string;
    status?: string;
}

export interface PaymentResponseData {
    status: string;
    transactionId: string;
    amount: number;
    provider: PaymentProvider;
    data: PaymentData;
}
