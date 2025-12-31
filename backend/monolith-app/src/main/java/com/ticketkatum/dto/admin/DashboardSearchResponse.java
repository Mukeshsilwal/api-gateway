package com.ticketkatum.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardSearchResponse {
    private List<SearchItem> items;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SearchItem {
        private String id;
        private String entity; // bus, route, ticket
        private String title;
        private String subtitle;
    }
}
