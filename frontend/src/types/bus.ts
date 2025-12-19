import { PaymentProvider, PaymentResponseData } from "./common";

export interface BusBookingRequest {
    tripId: string;
    seatIds: string[];
    passengerName: string;
    passengerEmail: string;
    passengerPhone: string;
    paymentProvider: PaymentProvider;
}

export interface BusBookingResponse {
    paymentData: PaymentResponseData;
}
