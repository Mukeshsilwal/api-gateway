package com.ticketkatum.enums;

public enum ResponseStatus {
    SUCCESS("0", "Success"),
    FAILED("1", "Failed");

    private final String code;
    private final String message;

    ResponseStatus(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String code() { return code; }
    public String message() { return message; }
}
