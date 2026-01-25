package com.ticketkatum.market.repository;

import com.ticketkatum.market.domain.LivePoll;
import com.ticketkatum.market.domain.PollStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

@org.springframework.stereotype.Repository
public interface LivePollRepository extends JpaRepository<LivePoll, Long> {
    List<LivePoll> findByEventIdAndStatus(String eventId, PollStatus status);
}
