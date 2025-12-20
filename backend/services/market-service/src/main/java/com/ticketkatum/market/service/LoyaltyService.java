package com.ticketkatum.market.service;

import com.ticketkatum.market.domain.LoyaltyProfile;
import com.ticketkatum.market.domain.PointTransaction;
import com.ticketkatum.market.domain.TierLevel;
import com.ticketkatum.market.repository.LoyaltyProfileRepository;
import com.ticketkatum.market.repository.PointTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoyaltyService {

    private final LoyaltyProfileRepository profileRepository;
    private final PointTransactionRepository transactionRepository;

    @Transactional
    public void earnPoints(long userId, int spendAmount, String source) {
        LoyaltyProfile profile = getOrCreateProfile(userId);
        
        // Calculate Multiplier based on Tier
        double multiplier = getTierMultiplier(profile.getTierLevel());
        int pointsEarned = (int) (spendAmount * multiplier);

        // Update Profile
        profile.setPointsBalance(profile.getPointsBalance() + pointsEarned);
        profile.setLifetimePoints(profile.getLifetimePoints() + pointsEarned);
        updateTier(profile);
        profileRepository.save(profile);

        // Record Transaction
        PointTransaction tx = PointTransaction.builder()
                .userId(userId)
                .amount(pointsEarned)
                .source(source)
                .description("Earned points from purchase")
                .build();
        transactionRepository.save(tx);
        
        log.info("User {} earned {} points. New Balance: {}", userId, pointsEarned, profile.getPointsBalance());
    }

    @Transactional
    public void redeemPoints(long userId, int pointsToRedeem, String source) {
        LoyaltyProfile profile = getOrCreateProfile(userId);

        if (profile.getPointsBalance() < pointsToRedeem) {
            throw new IllegalArgumentException("Insufficient points balance");
        }

        profile.setPointsBalance(profile.getPointsBalance() - pointsToRedeem);
        profileRepository.save(profile);

        PointTransaction tx = PointTransaction.builder()
                .userId(userId)
                .amount(-pointsToRedeem) // Negative for redemption
                .source(source)
                .description("Redeemed points for reward")
                .build();
        transactionRepository.save(tx);
        
        log.info("User {} redeemed {} points. New Balance: {}", userId, pointsToRedeem, profile.getPointsBalance());
    }

    public LoyaltyProfile getProfile(long userId) {
        return getOrCreateProfile(userId);
    }

    private LoyaltyProfile getOrCreateProfile(long userId) {
        return profileRepository.findById(userId)
                .orElseGet(() -> {
                    LoyaltyProfile newProfile = LoyaltyProfile.builder()
                            .userId(userId)
                            .pointsBalance(0)
                            .lifetimePoints(0)
                            .tierLevel(TierLevel.BRONZE)
                            .build();
                    return profileRepository.save(newProfile);
                });
    }

    private void updateTier(LoyaltyProfile profile) {
        int lifetime = profile.getLifetimePoints();
        TierLevel newTier = TierLevel.BRONZE;

        if (lifetime >= 2000) newTier = TierLevel.GOLD;
        else if (lifetime >= 500) newTier = TierLevel.SILVER;

        if (newTier != profile.getTierLevel()) {
            log.info("User {} upgraded to Tier {}", profile.getUserId(), newTier);
            profile.setTierLevel(newTier);
        }
    }

    private double getTierMultiplier(TierLevel tier) {
        return switch (tier) {
            case GOLD -> 1.2;
            case SILVER -> 1.1;
            default -> 1.0;
        };
    }
}
