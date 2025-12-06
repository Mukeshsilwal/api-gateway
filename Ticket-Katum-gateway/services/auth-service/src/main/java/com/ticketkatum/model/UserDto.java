package com.ticketkatum.model;


import com.ticketkatum.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.lang.Nullable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
    private int id1;
    @NonNull
    @Email
    @NotEmpty
    private String username;
    @NonNull
    @NotEmpty
    @Size(min = 7, max = 50)
    private String password;
    @Nullable
    private Role role;
    private String fullName;
    private String phone;
}
