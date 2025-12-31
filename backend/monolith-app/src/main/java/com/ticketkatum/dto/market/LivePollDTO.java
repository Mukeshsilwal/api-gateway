package com.ticketkatum.dto.market;

import com.ticketkatum.webbff.dto.market.PollStatus;
import lombok.Data;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class LivePollDTO {
    private UUID id;
    private String question;
    private List<String> options;
    private Map<String, Integer> votes;
    private PollStatus status;
}
