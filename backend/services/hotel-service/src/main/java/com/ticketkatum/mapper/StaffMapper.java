package com.ticketkatum.mapper;


import com.ticketkatum.entity.Staff;
import com.ticketkatum.model.StaffRequest;
import com.ticketkatum.model.StaffResponse;

public class StaffMapper {

    public static StaffResponse toResponse(Staff staff) {
        if (staff == null) return null;

        return StaffResponse.builder()
                .id(staff.getId())
                .fullName(staff.getFullName())
                .staffType(staff.getStaffType())
                .status(staff.getStatus())
                .phone(staff.getPhone())
                .notes(staff.getNotes())
                .build();
    }


    public static Staff toEntity(StaffRequest request) {
        if (request == null) return null;

        return Staff.builder()
                .fullName(request.getFullName())
                .staffType(request.getStaffType())
                .phone(request.getPhone())
                .notes(request.getNotes())
                .build();
    }

    public static void updateEntity(Staff staff, StaffRequest request) {
        if (staff == null || request == null) return;

        staff.setFullName(request.getFullName());
        staff.setStaffType(request.getStaffType());
        staff.setPhone(request.getPhone());
        staff.setNotes(request.getNotes());
    }
}
