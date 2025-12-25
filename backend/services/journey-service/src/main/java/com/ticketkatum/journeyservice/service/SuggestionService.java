package com.ticketkatum.journeyservice.service;

import com.ticketkatum.journeyservice.entity.Journey;
import com.ticketkatum.journeyservice.entity.JourneySuggestion;
import com.ticketkatum.journeyservice.repository.JourneyRepository;
import com.ticketkatum.journeyservice.repository.JourneySuggestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for generating and managing journey suggestions
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SuggestionService {

    private final JourneyRepository journeyRepository;
    private final JourneySuggestionRepository suggestionRepository;

    /**
     * Generate suggestions asynchronously
     */
    @Async
    @Transactional
    public void generateSuggestionsAsync(Long journeyId) {
        log.info("Starting async suggestion generation for journey: {}", journeyId);
        
        try {
            Journey journey = journeyRepository.findById(journeyId)
                    .orElseThrow(() -> new RuntimeException("Journey not found: " + journeyId));
            
            List<JourneySuggestion> suggestions = generateSuggestions(journey);
            
            suggestions.forEach(suggestion -> {
                suggestion.setJourney(journey);
                suggestionRepository.save(suggestion);
            });
            
            log.info("Generated {} suggestions for journey: {}", suggestions.size(), journeyId);
        } catch (Exception e) {
            log.error("Error generating suggestions for journey {}: {}", journeyId, e.getMessage());
        }
    }

    /**
     * Generate suggestions for a journey
     */
    private List<JourneySuggestion> generateSuggestions(Journey journey) {
        List<JourneySuggestion> suggestions = new ArrayList<>();
        
        // TODO: Implement ML-based suggestion generation
        // For now, generate some sample suggestions
        
        // Hotel suggestion
        suggestions.add(JourneySuggestion.builder()
                .suggestionType(JourneySuggestion.SuggestionType.HOTEL)
                .title("Recommended Hotel Near Your Destination")
                .description("4-star hotel with excellent reviews, 2km from main attractions")
                .estimatedCost(BigDecimal.valueOf(5000))
                .priority(1)
                .relevanceScore(BigDecimal.valueOf(0.92))
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build());
        
        // Activity suggestion
        suggestions.add(JourneySuggestion.builder()
                .suggestionType(JourneySuggestion.SuggestionType.ACTIVITY)
                .title("Popular Local Tour")
                .description("Half-day city tour covering major landmarks")
                .estimatedCost(BigDecimal.valueOf(2000))
                .priority(2)
                .relevanceScore(BigDecimal.valueOf(0.85))
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build());
        
        // Restaurant suggestion
        suggestions.add(JourneySuggestion.builder()
                .suggestionType(JourneySuggestion.SuggestionType.RESTAURANT)
                .title("Highly Rated Local Restaurant")
                .description("Authentic Nepali cuisine with vegetarian options")
                .estimatedCost(BigDecimal.valueOf(1500))
                .priority(3)
                .relevanceScore(BigDecimal.valueOf(0.78))
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build());
        
        return suggestions;
    }

    /**
     * Accept a suggestion
     */
    @Transactional
    public void acceptSuggestion(Long suggestionId) {
        log.info("Accepting suggestion: {}", suggestionId);
        
        JourneySuggestion suggestion = suggestionRepository.findById(suggestionId)
                .orElseThrow(() -> new RuntimeException("Suggestion not found: " + suggestionId));
        
        suggestion.setIsAccepted(true);
        suggestionRepository.save(suggestion);
        
        // TODO: Trigger booking flow for accepted suggestion
    }

    /**
     * Dismiss a suggestion
     */
    @Transactional
    public void dismissSuggestion(Long suggestionId) {
        log.info("Dismissing suggestion: {}", suggestionId);
        
        JourneySuggestion suggestion = suggestionRepository.findById(suggestionId)
                .orElseThrow(() -> new RuntimeException("Suggestion not found: " + suggestionId));
        
        suggestion.setIsDismissed(true);
        suggestionRepository.save(suggestion);
    }

    /**
     * Get active suggestions for a journey
     */
    @Transactional(readOnly = true)
    public List<JourneySuggestion> getActiveSuggestions(Long journeyId) {
        return suggestionRepository.findActiveSuggestions(journeyId, LocalDateTime.now());
    }

    /**
     * Clean up expired suggestions
     */
    @Transactional
    public void cleanupExpiredSuggestions() {
        log.info("Cleaning up expired suggestions");
        suggestionRepository.deleteExpiredSuggestions(LocalDateTime.now());
    }
}
