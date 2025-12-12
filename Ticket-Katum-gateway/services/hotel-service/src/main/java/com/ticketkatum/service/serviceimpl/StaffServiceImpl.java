package com.ticketkatum.service.serviceimpl;

import com.ticketkatum.entity.Hotel;
import com.ticketkatum.entity.Staff;
import com.ticketkatum.enums.StaffStatus;
import com.ticketkatum.mapper.StaffMapper;
import com.ticketkatum.model.StaffRequest;
import com.ticketkatum.model.StaffResponse;
import com.ticketkatum.repository.HotelRepository;
import com.ticketkatum.repository.StaffRepo;
import com.ticketkatum.service.StaffService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StaffServiceImpl implements StaffService {

    private final StaffRepo staffRepository;
    private final HotelRepository hotelRepository;

    @Override
    public StaffResponse  createStaff(StaffRequest request) {

        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        Staff staff = StaffMapper.toEntity(request);
        staff.setHotel(hotel);
        staff.setStatus(StaffStatus.ACTIVE);

        staffRepository.save(staff);

        return StaffMapper.toResponse(staff);
    }

    @Override
    public StaffResponse updateStatus(Long staffId, String status) {

        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        staff.setStatus(StaffStatus.valueOf(status.toUpperCase()));
        staffRepository.save(staff);

        return StaffMapper.toResponse(staff);
    }

    @Override
    public List<StaffResponse> getStaffByHotel(Long hotelId) {

        return staffRepository.findByHotelId(hotelId)
                .stream()
                .map(StaffMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Staff getAvailableStaff(Long hotelId, String staffType) {

        return staffRepository.findFirstAvailableStaff(
                hotelId,
                staffType.toUpperCase(),
                StaffStatus.ACTIVE.name()
        );

    }
}
