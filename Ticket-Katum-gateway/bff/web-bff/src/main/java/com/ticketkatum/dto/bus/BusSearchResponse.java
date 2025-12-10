package com.ticketkatum.dto.bus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusSearchResponse {

    // List of buses returned for the current page
    private List<BusDto> buses;

    // Cursor = the last bus ID returned in this batch
    // Frontend will send this cursor again to fetch next page
    private int nextCursor;

    // true if more results exist beyond this page
    private boolean hasMore;
}
