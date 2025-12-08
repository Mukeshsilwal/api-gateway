package com.ticketkatum.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Role {
    ADMIN,
    SUPER_ADMIN,
    USER
}
