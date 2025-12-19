import http from "./http";
import { HotelBookingRequest, HotelBookingResponse } from "../types/hotel";

export const completeHotelBooking = async (
    data: HotelBookingRequest
): Promise<HotelBookingResponse> => {
    const response = await http.post<HotelBookingResponse>(
        "/v1/bookings/complete",
        data
    );
    return response.data;
};
