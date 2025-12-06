package com.ticketkatum.service.serviceimpl;

import com.ticketkatum.entity.Room;
import com.ticketkatum.entity.RoomMaintenance;
import com.ticketkatum.mapper.RoomMaintenanceMapper;
import com.ticketkatum.model.RoomMaintenanceRequest;
import com.ticketkatum.model.RoomMaintenanceResponse;
import com.ticketkatum.repository.RoomMaintenanceRepo;
import com.ticketkatum.repository.RoomRepository;
import com.ticketkatum.service.RoomMaintenanceService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoomMaintenanceServiceImpl implements RoomMaintenanceService {

    private final RoomMaintenanceRepo maintenanceRepo;
    private final RoomRepository roomRepo;
    private final RoomMaintenanceMapper mapper;

    @Override
    public RoomMaintenanceResponse createOrUpdate(RoomMaintenanceRequest req) {

        Room room = roomRepo.findById(req.getRoomId())
                .orElseThrow(() -> new EntityNotFoundException("Room not found"));

        RoomMaintenance maintenance = maintenanceRepo.findByRoomId(room.getId())
                .orElse(new RoomMaintenance());

        maintenance.setRoom(room);
        maintenance.setRoomStatus(req.getRoomStatus());
        maintenance.setCleaningStatus(req.getCleaningStatus());
        maintenance.setMaintenanceStatus(req.getMaintenanceStatus());
        maintenance.setAmenitiesStatus(req.getAmenitiesStatus());
        maintenance.setSuggestions(req.getSuggestions());
        maintenance.setAssignedStaff(req.getAssignedStaff());

        maintenanceRepo.save(maintenance);

        return mapper.toResponse(maintenance);
    }

    @Override
    public RoomMaintenanceResponse assignStaff(Long maintenanceId, String staffName) {

        RoomMaintenance m = maintenanceRepo.findById(maintenanceId)
                .orElseThrow(() -> new EntityNotFoundException("Maintenance record not found"));

        m.setAssignedStaff(staffName);

        if (!m.getSuggestions().contains("Staff assigned: " + staffName)) {
            m.getSuggestions().add("Staff assigned: " + staffName);
        }

        maintenanceRepo.save(m);

        return mapper.toResponse(m);
    }

    @Override
    public RoomMaintenanceResponse getByRoomId(Long roomId) {
        RoomMaintenance m = maintenanceRepo.findByRoomId(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Maintenance record not found"));

        return mapper.toResponse(m);
    }
}


