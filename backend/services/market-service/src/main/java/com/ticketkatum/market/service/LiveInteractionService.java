package com.ticketkatum.market.service;

import com.ticketkatum.market.domain.LivePoll;
import com.ticketkatum.market.domain.PollStatus;
import com.ticketkatum.market.repository.LivePollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LiveInteractionService {

    private final LivePollRepository pollRepository;

    public List<LivePoll> getActivePolls(Long eventId) {
        return pollRepository.findByEventIdAndStatus(eventId.toString(), PollStatus.ACTIVE);
    }

    @Transactional
    public void castVote(long pollId, String selectedOption) {
        LivePoll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new IllegalArgumentException("Poll not found"));

        if (!poll.getOptions().contains(selectedOption)) {
            throw new IllegalArgumentException("Invalid option");
        }

        poll.getVotes().merge(selectedOption, 1, Integer::sum);
        pollRepository.save(poll);
    }

    // Admin method to create poll
    public LivePoll createPoll(LivePoll poll) {
        poll.setStatus(PollStatus.ACTIVE);
        return pollRepository.save(poll);
    }
}
