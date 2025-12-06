package com.ticketkatum.service.serviceimpl;

import com.ticketkatum.algorithm.DynamicPricingAlgorithm;
import com.ticketkatum.entity.Bus;
import com.ticketkatum.entity.Seat;
import com.ticketkatum.mapper.SeatMapper;
import com.ticketkatum.model.SeatDto;
import com.ticketkatum.repository.BusRepo;
import com.ticketkatum.repository.SeatRepo;
import com.ticketkatum.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class SeatServiceImpl implements SeatService {

    private final SeatRepo seatRepo;
    private final BusRepo busRepo;
    private final SeatMapper seatMapper;
    private final DynamicPricingAlgorithm pricingAlgorithm;


    @Override
    public SeatDto createSeatForBus(SeatDto dto, long busId) {

        Bus bus = busRepo.findById(busId)
                .orElseThrow(() -> new RuntimeException());

        Seat seat = seatMapper.toEntity(dto);
        seat.setBus(bus);
        seat.setReserved(false);

        int availableSeats = calculateAvailableSeats(bus);
        seat.setPrice(pricingAlgorithm.calculateDynamicPrice(availableSeats, bus));

        Seat savedSeat = seatRepo.save(seat);
        return seatMapper.toDto(savedSeat);
    }

    @Override
    public List<SeatDto> createMultipleSeatsForBus(List<SeatDto> seatDtos, long busId) {

        Bus bus = busRepo.findById(busId)
                .orElseThrow(() -> new RuntimeException());

        int availableSeats = calculateAvailableSeats(bus);

        List<Seat> seats = seatDtos.stream()
                .map(dto -> {
                    Seat seat = seatMapper.toEntity(dto);
                    seat.setReserved(false);
                    seat.setBus(bus);
                    seat.setPrice(pricingAlgorithm.calculateDynamicPrice(availableSeats, bus));
                    return seat;
                }).collect(Collectors.toList());

        List<Seat> saved = seatRepo.saveAll(seats);
        return seatMapper.toDtoList(saved);
    }

    @Override
    public SeatDto updateSeat(SeatDto dto, long id) {
        Seat seat = seatRepo.findById(id)
                .orElseThrow(() -> new RuntimeException());

        seat.setSeatNumber(dto.getSeatNumber());
        seat.setReserved(dto.isReserved());

        Seat updated = seatRepo.save(seat);
        return seatMapper.toDto(updated);
    }

    @Override
    public void deleteSeat(long id) {
        Seat seat = seatRepo.findById(id)
                .orElseThrow(() -> new RuntimeException());

        Bus bus = seat.getBus();

        if (bus != null) {
            bus.getSeats().remove(seat);
            busRepo.save(bus);
        }

        seatRepo.delete(seat);
    }

    @Override
    public SeatDto getSeatById(long id) {
        Seat seat = seatRepo.findById(id)
                .orElseThrow(() -> new RuntimeException());
        return seatMapper.toDto(seat);
    }

    @Override
    public List<SeatDto> getAllSeat() {
        return seatMapper.toDtoList(seatRepo.findAll());
    }

    @Override
    public List<SeatDto> findSeatRelatedToBus(String busName) {
        List<Seat> seats = seatRepo.findByBusBusName(busName);
        return seatMapper.toDtoList(seats);
    }

    @Override
    public SeatDto reserveSeat(long seatId) {
        Seat seat = seatRepo.findById(seatId)
                .orElseThrow(() -> new RuntimeException());

        if (seat.isReserved()) {
            throw new IllegalStateException("Seat already reserved");
        }

        seat.setReserved(true);
        Seat updated = seatRepo.save(seat);

        return seatMapper.toDto(updated);
    }


    private int calculateAvailableSeats(Bus bus) {
        int total = bus.getSeats().size();
        int reserved = (int) bus.getSeats().stream().filter(Seat::isReserved).count();
        return total - reserved;
    }
}
