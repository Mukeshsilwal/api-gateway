package com.ticketkatum.dto.bus;

import com.ticketkatum.dto.hotel.PriceRange;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class AggregatedBusSearchResults {
    private List<EnrichedBusDto> buses;
    private int totalResults;
    private BusSearchRequest searchCriteria;
    private PriceRange priceRange;
    private List<String> availableOperators;
    private String earliestDeparture;
    private String latestDeparture;
    private boolean hasMoreResults;
    private Integer nextCursor;
}
