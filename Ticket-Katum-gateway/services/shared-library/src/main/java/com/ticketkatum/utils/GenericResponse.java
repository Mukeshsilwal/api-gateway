package com.ticketkatum.utils;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenericResponse<T> {

    private boolean success;
    private String message;
    private String code;
    private T data;
    private String requestId;
    private LocalDateTime timestamp;
    private ErrorDetails error;

}
