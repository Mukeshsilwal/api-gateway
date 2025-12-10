package com.ticketkatum.service.serviceimpl;

import com.ticketkatum.entity.BusStop;
import com.ticketkatum.mapper.BusStopMapper;
import com.ticketkatum.model.BusStopDto;
import com.ticketkatum.repository.BusStopRepo;
import com.ticketkatum.service.BusStopService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BusStopServiceImpl implements BusStopService {

    private final BusStopRepo busStopRepo;
    private final BusStopMapper mapper;

    public BusStopServiceImpl(BusStopRepo busStopRepo, BusStopMapper mapper) {
        this.busStopRepo = busStopRepo;
        this.mapper = mapper;
    }

    @Override
    public BusStopDto createBusStop(BusStopDto dto) {
        BusStop entity = mapper.toEntity(dto);
        return mapper.toDto(busStopRepo.save(entity));
    }

    @Override
    public BusStopDto updateBusStop(BusStopDto dto, long id) {
        BusStop existing = busStopRepo.findById(id)
                .orElseThrow(() -> new RuntimeException());

        mapper.updateEntity(dto, existing);
        return mapper.toDto(busStopRepo.save(existing));
    }

    @Override
    public void deleteBusStop(long id) {
        BusStop entity = busStopRepo.findById(id)
                .orElseThrow(() -> new RuntimeException());

        busStopRepo.delete(entity);
    }

    @Override
    public List<BusStopDto> getAllBusStops() {
        return busStopRepo.findAll()
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public BusStopDto getBusStopById(long id) {
        BusStop entity = busStopRepo.findById(id)
                .orElseThrow(() -> new RuntimeException());
        return mapper.toDto(entity);
    }

    @Override
    public Page<BusStopDto> getBusStops(Pageable pageable) {
        return busStopRepo.findAll(pageable)
                .map(mapper::toDto);
    }

}
