import http from "./http";
import { BusBookingRequest, BusBookingResponse } from "../types/bus";

export const completeBusBooking = async (
    data: BusBookingRequest
): Promise<BusBookingResponse> => {
    const response = await http.post<BusBookingResponse>(
        "/v1/buses/complete-booking",
        data
    );
    return response.data;
};
