package com.ticketkatum.service;

import com.ticketkatum.entity.Staff;
import com.ticketkatum.model.StaffRequest;
import com.ticketkatum.model.StaffResponse;

import java.util.List;

public interface StaffService {

    StaffResponse createStaff(StaffRequest request);

    StaffResponse updateStatus(Long staffId, String status);

    List<StaffResponse> getStaffByHotel(Long hotelId);

    Staff getAvailableStaff(Long hotelId, String staffType);
}
