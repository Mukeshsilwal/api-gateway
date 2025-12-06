package com.ticketkatum.enums;

public enum Priority {
    LOW(3), MEDIUM(2), HIGH(1), URGENT(0);

    private final int value;

    Priority(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}