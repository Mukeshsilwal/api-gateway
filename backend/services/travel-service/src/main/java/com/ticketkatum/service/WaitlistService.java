package com.ticketkatum.service;

import com.ticketkatum.entity.Waitlist;
import com.ticketkatum.repository.WaitlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WaitlistService {

    private final WaitlistRepository waitlistRepository;

    @Transactional
    public Waitlist joinWaitlist(Long eventId, String email, String name) {
        log.info("Adding {} to waitlist for event {}", email, eventId);

        // Check if already on waitlist
        if (waitlistRepository.findByEventIdAndEmail(eventId, email).isPresent()) {
            throw new RuntimeException("Email already on waitlist");
        }

        Waitlist waitlist = Waitlist.builder()
                .eventId(eventId)
                .email(email)
                .name(name)
                .status(Waitlist.Status.WAITING)
                .joinedAt(LocalDateTime.now())
                .build();

        return waitlistRepository.save(waitlist);
    }

    public List<Waitlist> getWaitlistByEvent(Long eventId) {
        return waitlistRepository.findByEventId(eventId);
    }

    public Map<String, Object> getWaitlistStats(Long eventId) {
        List<Waitlist> allWaitlist = waitlistRepository.findByEventId(eventId);
        List<Waitlist> waiting = waitlistRepository.findByEventIdAndStatus(eventId, Waitlist.Status.WAITING);
        List<Waitlist> notified = waitlistRepository.findByEventIdAndStatus(eventId, Waitlist.Status.NOTIFIED);
        List<Waitlist> converted = waitlistRepository.findByEventIdAndStatus(eventId, Waitlist.Status.CONVERTED);

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", allWaitlist.size());
        stats.put("waiting", waiting.size());
        stats.put("notified", notified.size());
        stats.put("converted", converted.size());
        stats.put("conversionRate", allWaitlist.isEmpty() ? 0 : (converted.size() * 100.0 / allWaitlist.size()));

        return stats;
    }

    @Transactional
    public void notifyWaitlist(Long eventId) {
        log.info("Notifying waitlist for event {}", eventId);

        List<Waitlist> waiting = waitlistRepository.findByEventIdAndStatus(eventId, Waitlist.Status.WAITING);

        for (Waitlist entry : waiting) {
            entry.setStatus(Waitlist.Status.NOTIFIED);
            entry.setNotifiedAt(LocalDateTime.now());
            waitlistRepository.save(entry);

            // TODO: Send email notification
            log.info("Notified: {}", entry.getEmail());
        }
    }

    @Transactional
    public void removeFromWaitlist(Long id) {
        waitlistRepository.deleteById(id);
    }
}
