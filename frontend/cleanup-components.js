// Cleanup script for components
const fs = require('fs');
const path = require('path');

const componentsToClean = [
    'src/components/waitlist/WaitlistButton.tsx',
    'src/components/unified-booking/UnifiedBookingCart.tsx',
    'src/components/unified-booking/CartItem.tsx',
    'src/components/unified-booking/CartDrawer.tsx',
    'src/components/ui/Button.tsx',
    'src/components/social/SocialShare.tsx',
    'src/components/SeatIcon.tsx',
    'src/components/ProtectedRoute.tsx',
    'src/components/promo/PromoCodeInput.tsx',
    'src/components/PaymentProviderSelector.tsx',
    'src/components/Navbar.tsx',
    'src/components/MainLayout.tsx',
    'src/components/LoginForm.tsx',
    'src/components/Loader.tsx',
    'src/components/home/SocialProofSection.tsx',
    'src/components/HeroSection.tsx',
    'src/components/forms/SearchForm.tsx',
    'src/components/Footer.tsx',
    'src/components/EventSearchComponent.tsx',
    'src/components/events/VenueScheduleForm.tsx',
    'src/components/events/TicketingForm.tsx',
    'src/components/events/ReviewEvent.tsx',
    'src/components/events/EventWizard.tsx',
    'src/components/events/EventCloneButton.tsx',
    'src/components/events/BasicInfoForm.tsx',
    'src/components/EventCard.tsx',
    'src/components/ErrorBanner.tsx',
    'src/components/displays/PriceBreakdown.tsx',
    'src/components/displays/PaymentStatus.tsx',
    'src/components/displays/BookingTimeline.tsx',
    'src/components/common/ImageUpload.tsx',
    'src/components/checkin/CheckInManager.tsx',
    'src/components/checkin/QRScanner.tsx',
    'src/components/CartIntegration.tsx',
    'src/components/calendar/EventCalendar.tsx',
    'src/components/cards/EventCard.tsx',
    'src/components/cards/HotelCard.tsx',
    'src/components/cards/BusCard.tsx',
    'src/components/BusSearchComponent.tsx',
    'src/components/analytics/AnalyticsDashboard.tsx',
    'src/components/booking/SeatMap.tsx',
    'src/components/booking/CartIcon.tsx',
    'src/components/booking/BookingCart.tsx',
    'src/components/admin/AdminLayout.tsx',
    'src/components/admin/AdminRequestManager.tsx',
    'src/components/admin/BusManager.tsx',
    'src/components/admin/BusSeatPreview.tsx',
    'src/components/admin/CinemaManager.tsx',
    'src/components/admin/CommandPalette.tsx'
];

let cleanedCount = 0;

componentsToClean.forEach(file => {
    const filePath = path.join(__dirname, file);

    try {
        if (!fs.existsSync(filePath)) {
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // Remove standalone "import React from 'react';"
        content = content.replace(/^import React from ['"]react['"];?\r?\n/m, '');

        // Replace "import React, { ... }" with "import { ... }"
        content = content.replace(/^import React, \{/m, 'import {');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ${file}`);
            cleanedCount++;
        }
    } catch (error) {
        console.error(`❌ ${file}:`, error.message);
    }
});

console.log(`\n✅ Components cleaned: ${cleanedCount}`);
