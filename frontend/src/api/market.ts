import http from "./http";
import { MarketPurchaseRequest, MarketPurchaseResponse } from "../types/market";

export const completeMarketPurchase = async (
    data: MarketPurchaseRequest
): Promise<MarketPurchaseResponse> => {
    const response = await http.post<MarketPurchaseResponse>(
        "/market/resale/complete-buy",
        data
    );
    return response.data;
};
