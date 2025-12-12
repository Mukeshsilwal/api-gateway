package com.ticketkatum.service.serviceimpl;

import com.ticketkatum.algorithm.DynamicPricingAlgorithm;
import com.ticketkatum.entity.Bus;
import com.ticketkatum.entity.Seat;
import com.ticketkatum.enums.SeatStatus;
import com.ticketkatum.mapper.SeatMapper;
import com.ticketkatum.model.SeatDto;
import com.ticketkatum.repository.BusRepo;
import com.ticketkatum.repository.SeatRepo;
import com.ticketkatum.service.SeatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
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
                .orElseThrow(() -> new RuntimeException("Bus not found"));

        Seat seat = seatMapper.toEntity(dto);
        seat.setBus(bus);
        seat.setStatus(SeatStatus.AVAILABLE); // Default

        int availableSeats = calculateAvailableSeats(bus);
        seat.setPrice(pricingAlgorithm.calculateDynamicPrice(availableSeats, bus));

        Seat savedSeat = seatRepo.save(seat);
        return seatMapper.toDto(savedSeat);
    }

    @Override
    public List<SeatDto> createMultipleSeatsForBus(List<SeatDto> seatDtos, long busId) {
        Bus bus = busRepo.findById(busId)
                .orElseThrow(() -> new RuntimeException("Bus not found"));

        int availableSeats = calculateAvailableSeats(bus);

        List<Seat> seats = seatDtos.stream()
                .map(dto -> {
                    Seat seat = seatMapper.toEntity(dto);
                    seat.setStatus(SeatStatus.AVAILABLE);
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
                .orElseThrow(() -> new RuntimeException("Seat not found"));

        seat.setSeatNumber(dto.getSeatNumber());
        // Simple update doesn't change lock status usually, but let's respect provided
        // status if any
        // For now, keep existing status logic or update based on boolean
        if (dto.isReserved()) {
            seat.setStatus(SeatStatus.BOOKED);
        } else {
            seat.setStatus(SeatStatus.AVAILABLE);
        }

        Seat updated = seatRepo.save(seat);
        return seatMapper.toDto(updated);
    }

    @Override
    public void deleteSeat(long id) {
        Seat seat = seatRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Seat not found"));
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
                .orElseThrow(() -> new RuntimeException("Seat not found"));
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
    @Deprecated
    public SeatDto reserveSeat(long seatId) {
        // Deprecated simple reserve, mapping to BOOKED
        Seat seat = seatRepo.findById(seatId).orElseThrow();
        seat.setStatus(SeatStatus.BOOKED);
        return seatMapper.toDto(seatRepo.save(seat));
    }

    // === SOFT HOLD LOGIC ===

    @Override
    @Transactional
    public SeatDto selectSeat(long seatId, Long userId) {
        // 1. Lock the seat row to prevent race conditions
        Seat seat = seatRepo.findSeatForUpdate(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found"));

        // 2. Check current status
        if (seat.getStatus() == SeatStatus.BOOKED) {
            throw new IllegalStateException("Seat is already BOOKED.");
        }

        if (seat.getStatus() == SeatStatus.HELD) {
            if (seat.getHoldExpiresAt().isAfter(LocalDateTime.now())) {
                // Already held and not expired
                if (seat.getHoldByUserId().equals(userId)) {
                    // Same user re-selecting, refresh timer
                    seat.setHoldExpiresAt(LocalDateTime.now().plusMinutes(10));
                    return seatMapper.toDto(seatRepo.save(seat));
                } else {
                    throw new IllegalStateException("Seat is temporarily UNAVAILABLE (Held by another user).");
                }
            } else {
                // Expired hold, we can take it!
                log.info("Overwriting expired hold for seat {}", seatId);
            }
        }

        // 3. Apply Soft Hold
        seat.setStatus(SeatStatus.HELD);
        seat.setHoldByUserId(userId);
        seat.setHoldExpiresAt(LocalDateTime.now().plusMinutes(10)); // 10 min TTL

        return seatMapper.toDto(seatRepo.save(seat));
    }

    @Override
    @Transactional
    public SeatDto confirmSeat(long seatId, Long userId) {
        Seat seat = seatRepo.findSeatForUpdate(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found"));

        if (seat.getStatus() == SeatStatus.BOOKED) {
            // Idempotency: if already booked by same user, return success
            // In real app checks booking ownership
            return seatMapper.toDto(seat);
        }

        if (seat.getStatus() == SeatStatus.AVAILABLE) {
            throw new IllegalStateException("Seat was not held. Please select it first.");
        }

        if (seat.getStatus() == SeatStatus.HELD) {
            // Check expiry
            if (seat.getHoldExpiresAt().isBefore(LocalDateTime.now())) {
                throw new IllegalStateException("Hold expired. Please select it again.");
            }
            // Check ownership
            if (!seat.getHoldByUserId().equals(userId)) {
                throw new IllegalStateException("Seat held by another user.");
            }
        }

        // Convert to Hard Booking
        seat.setStatus(SeatStatus.BOOKED);
        seat.setHoldExpiresAt(null);
        // keep holdByUserId as record or clear it depending on needs. Keeping it is
        // fine.

        return seatMapper.toDto(seatRepo.save(seat));
    }

    @Override
    @Scheduled(fixedRate = 60000) // Run every 1 minute
    @Transactional
    public void releaseExpiredSeats() {
        List<Seat> expiredSeats = seatRepo.findByStatusAndHoldExpiresAtBefore(
                SeatStatus.HELD, LocalDateTime.now());

        if (!expiredSeats.isEmpty()) {
            log.info("Releasing {} expired seats...", expiredSeats.size());
            for (Seat seat : expiredSeats) {
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setHoldByUserId(null);
                seat.setHoldExpiresAt(null);
            }
            seatRepo.saveAll(expiredSeats);
        }
    }

    private int calculateAvailableSeats(Bus bus) {
        int total = bus.getSeats().size();
        int reserved = (int) bus.getSeats().stream()
                .filter(s -> s.getStatus() != SeatStatus.AVAILABLE)
                .count();
        return total - reserved;
    }
}
