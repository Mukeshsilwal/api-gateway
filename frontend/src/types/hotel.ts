import { PaymentProvider, PaymentResponseData } from "./common";

export interface HotelBookingRequest {
    hotelId: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    paymentProvider: PaymentProvider;
}

export interface HotelBookingResponse {
    paymentData: PaymentResponseData;
}
