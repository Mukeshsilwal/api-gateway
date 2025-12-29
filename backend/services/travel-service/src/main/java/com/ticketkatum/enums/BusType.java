package com.ticketkatum.enums;

public enum BusType {
    DELUXE("Deluxe"),
    STANDARD( "Standard"),
    SEMI_DELUXE( "Semi Deluxe"),
    VIP("Vip");

    private String busType;

    BusType(String busType) {
        this.busType = busType;
    }

    public String getBusType() {
        return busType;
    }

    public void setBusType(String busType) {
        this.busType = busType;
    }

    public static BusType fromString(String busType) {
        for (BusType type : BusType.values()) {
            if (type.getBusType().equalsIgnoreCase(busType)) {
                return type;
            }
        }
        return null;
    }


}
