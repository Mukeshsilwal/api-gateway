package com.ticketkatum.service;


import com.ticketkatum.model.ChangePasswordRequest;
import com.ticketkatum.model.User;
import com.ticketkatum.model.UserDto;

import java.util.List;

public interface UserService {
    UserDto createUser(UserDto userDto);

    void deleteUser(Integer id);

    UserDto updateUser(UserDto userDto, Integer id);

    UserDto getUserById(Integer id);

    List<UserDto> getAllUser();

    void changePassword(ChangePasswordRequest changePasswordRequest);

    void sentOtp(User users);

}
