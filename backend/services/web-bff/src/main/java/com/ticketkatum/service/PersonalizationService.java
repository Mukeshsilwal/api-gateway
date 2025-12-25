package com.ticketkatum.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class PersonalizationService {

    /**
     * Get rule-based recommendations for a user's trip
     */
    public List<Map<String, Object>> getTripRecommendations(Map<String, Object> userContext,
            Map<String, Object> tripContext) {
        log.info("Generating personalized recommendations for trip...");
        List<Map<String, Object>> recommendations = new ArrayList<>();

        String touristType = (String) tripContext.getOrDefault("touristType", "DOMESTIC");
        Double budget = getDouble(tripContext.get("budget"));
        String currentLocation = (String) tripContext.get("currentLocationName");

        // Rule 1: Budget-based transport suggestion
        if (budget != null && budget < 5000) {
            recommendations.add(createRecommendation(
                    "SAVINGS",
                    "Budget Travel Tip",
                    "Consider taking the Deluxe Bus instead of a flight to save NPR 4,000 for local dining.",
                    "HIGH"));
        }

        // Rule 2: Culture/Identity based
        if ("FOREIGN".equalsIgnoreCase(touristType)) {
            recommendations.add(createRecommendation(
                    "CULTURE",
                    "Local Experience",
                    "Visit the Patan Museum on your way - it has excellent English guides and historical context.",
                    "MEDIUM"));
        } else {
            recommendations.add(createRecommendation(
                    "OFFER",
                    "Domestic Discount",
                    "Get 20% off at traditional Thakali kitchens in Pokhara for Nepali citizens.",
                    "MEDIUM"));
        }

        // Rule 3: Safety/Activity based
        if (Boolean.TRUE.equals(tripContext.get("isTrek"))) {
            recommendations.add(createRecommendation(
                    "SAFETY",
                    "Trek Preparation",
                    "Altitude sickness is common in this route. Carry O2 canisters and stay hydrated.",
                    "CRITICAL"));
        }

        return recommendations;
    }

    private Map<String, Object> createRecommendation(String type, String title, String content, String importance) {
        Map<String, Object> rec = new HashMap<>();
        rec.put("type", type);
        rec.put("title", title);
        rec.put("content", content);
        rec.put("importance", importance);
        return rec;
    }

    private Double getDouble(Object o) {
        if (o == null)
            return null;
        if (o instanceof Number)
            return ((Number) o).doubleValue();
        return Double.parseDouble(o.toString());
    }
}
