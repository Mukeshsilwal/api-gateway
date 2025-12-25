package com.ticketkatum.guide.service;

import com.ticketkatum.guide.dto.AvailabilityDTO;
import com.ticketkatum.guide.dto.GuideDTO;
import com.ticketkatum.guide.dto.ServicePackageDTO;
import com.ticketkatum.guide.entity.*;
import com.ticketkatum.guide.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class GuideService {

    private final GuideRepository guideRepository;
    private final ServicePackageRepository servicePackageRepository;
    private final GuideAvailabilityRepository guideAvailabilityRepository;
    private final GuideSpecialtyRepository guideSpecialtyRepository;
    private final GuideLanguageRepository guideLanguageRepository;
    private final ReviewRepository reviewRepository;

    public GuideDTO registerGuide(GuideDTO request) {
        log.info("Registering guide for user: {}", request.getUserId());
        
        if (guideRepository.existsByUserId(request.getUserId())) {
            throw new RuntimeException("Guide profile already exists for user");
        }

        Guide guide = Guide.builder()
                .userId(request.getUserId())
                .fullName(request.getFullName())
                .licenseNumber(request.getLicenseNumber())
                .yearsExperience(request.getYearsExperience())
                .bio(request.getBio())
                .profileImageUrl(request.getProfileImageUrl())
                .verificationStatus(Guide.VerificationStatus.PENDING)
                .isActive(true)
                .build();
        
        Guide savedGuide = guideRepository.save(guide);
        
        // Save specialties
        if (request.getSpecialties() != null) {
            request.getSpecialties().forEach(s -> {
                guideSpecialtyRepository.save(GuideSpecialty.builder()
                        .guide(savedGuide)
                        .specialty(s)
                        .build());
            });
        }
        
        // Save languages
        if (request.getLanguages() != null) {
            request.getLanguages().forEach(l -> {
                guideLanguageRepository.save(GuideLanguage.builder()
                        .guide(savedGuide)
                        .language(l)
                        .build());
            });
        }

        return GuideDTO.fromEntity(savedGuide, request.getSpecialties(), request.getLanguages());
    }

    public GuideDTO getGuideProfile(Long guideId) {
        Guide guide = guideRepository.findById(guideId)
                .orElseThrow(() -> new RuntimeException("Guide not found"));
        
        List<String> specialties = guideSpecialtyRepository.findAll().stream()
                .filter(gs -> Objects.equals(gs.getGuide().getGuideId(), guideId))
                .map(GuideSpecialty::getSpecialty)
                .collect(Collectors.toList());

        List<String> languages = guideLanguageRepository.findAll().stream()
                .filter(gl -> Objects.equals(gl.getGuide().getGuideId(), guideId))
                .map(GuideLanguage::getLanguage)
                .collect(Collectors.toList());

        return GuideDTO.fromEntity(guide, specialties, languages);
    }

    public GuideDTO updateGuideProfile(Long guideId, GuideDTO request) {
        log.info("Updating guide profile: {}", guideId);
        Guide guide = guideRepository.findById(guideId)
                .orElseThrow(() -> new RuntimeException("Guide not found"));

        guide.setFullName(request.getFullName());
        guide.setBio(request.getBio());
        guide.setYearsExperience(request.getYearsExperience());
        guide.setProfileImageUrl(request.getProfileImageUrl());
        // License number update might require re-verification logic

        return GuideDTO.fromEntity(guideRepository.save(guide), request.getSpecialties(), request.getLanguages());
    }

    public ServicePackageDTO createPackage(Long guideId, ServicePackageDTO request) {
        log.info("Creating package for guide: {}", guideId);
        Guide guide = guideRepository.findById(guideId)
                .orElseThrow(() -> new RuntimeException("Guide not found"));

        ServicePackage pkg = ServicePackage.builder()
                .guide(guide)
                .title(request.getTitle())
                .description(request.getDescription())
                .durationHours(request.getDurationHours())
                .price(request.getPrice())
                .currency(request.getCurrency() != null ? request.getCurrency() : "NPR")
                .maxGroupSize(request.getMaxGroupSize())
                .isActive(true)
                .build();

        return ServicePackageDTO.fromEntity(servicePackageRepository.save(pkg));
    }

    public List<ServicePackageDTO> getGuidePackages(Long guideId) {
        return servicePackageRepository.findByGuide_GuideIdAndIsActiveTrue(guideId).stream()
                .map(ServicePackageDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<AvailabilityDTO> getAvailability(Long guideId, LocalDate fromDate, LocalDate toDate) {
        return guideAvailabilityRepository.findByGuide_GuideIdAndDateBetween(guideId, fromDate, toDate).stream()
                .map(AvailabilityDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public AvailabilityDTO setAvailability(Long guideId, LocalDate date, String status) {
        Guide guide = guideRepository.findById(guideId)
                .orElseThrow(() -> new RuntimeException("Guide not found"));

        // Check if exists
        GuideAvailability availability = guideAvailabilityRepository
                .findFutureAvailability(guideId, date).stream()
                .filter(a -> a.getDate().equals(date))
                .findFirst()
                .orElse(GuideAvailability.builder()
                        .guide(guide)
                        .date(date)
                        .build());
        
        availability.setStatus(GuideAvailability.AvailabilityStatus.valueOf(status));

        return AvailabilityDTO.fromEntity(guideAvailabilityRepository.save(availability));
    }
}
