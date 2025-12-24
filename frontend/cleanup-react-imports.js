// Automated cleanup script for removing unused React imports
const fs = require('fs');
const path = require('path');

const filesToClean = [
    'src/pages/PlaneList.tsx',
    'src/pages/PlaneSeatSelection.tsx',
    'src/pages/PaymentStatus.tsx',
    'src/pages/PlaneTicketConfirm.tsx',
    'src/pages/QfxBookingConfirmation.tsx',
    'src/pages/QfxMovieDetails.tsx',
    'src/pages/QfxMovies.tsx',
    'src/pages/QfxSeatSelection.tsx',
    'src/pages/register.tsx',
    'src/pages/PaymentRedirect.tsx',
    'src/pages/SuperAdminLogin.tsx',
    'src/pages/TicketConfirm.tsx',
    'src/pages/TicketDetails.tsx',
    'src/pages/UnifiedCheckout.tsx',
    'src/pages/UserLogin.tsx',
    'src/pages/UserRegister.tsx',
    'src/pages/PaymentFailure.tsx',
    'src/pages/PaymentCallback.tsx',
    'src/pages/OtpModal.tsx',
    'src/pages/NotFound.tsx',
    'src/pages/NearbyHotels.tsx',
    'src/pages/organizer/OrganizerDashboardPage.tsx',
    'src/pages/organizer/EventCreationPage.tsx',
    'src/pages/MyBookings.tsx',
    'src/pages/MarketPurchasePage.tsx',
    'src/pages/MarketDashboard.tsx',
    'src/pages/login.tsx',
    'src/pages/HotelSearchPage.tsx',
    'src/pages/HotelList.tsx',
    'src/pages/HotelDetailsPage.tsx',
    'src/pages/HotelDetail.tsx',
    'src/pages/HotelBookingConfirmation.tsx',
    'src/pages/HotelBookingPage.tsx',
    'src/pages/HotelBooking.tsx',
    'src/pages/Homepage.tsx',
    'src/pages/EventTickets.tsx',
    'src/pages/EventList.tsx',
    'src/pages/EventCheckInPage.tsx',
    'src/pages/EventCalendarPage.tsx',
    'src/pages/EventBooking.tsx',
    'src/pages/EsewaSuccess.tsx',
    'src/pages/EsewaFailure.tsx',
    'src/pages/EsewaDemo.tsx',
    'src/pages/ErrorPage.tsx',
    'src/pages/ChangePassword.tsx',
    'src/pages/BusSeatSelectionPage.tsx',
    'src/pages/BusSearchPage.tsx',
    'src/pages/BusList.tsx',
    'src/pages/BusBookingPage.tsx',
    'src/pages/BusBooking.tsx'
];

let cleanedCount = 0;
let errorCount = 0;

filesToClean.forEach(file => {
    const filePath = path.join(__dirname, file);

    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${file}`);
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
            console.log(`✅ Cleaned: ${file}`);
            cleanedCount++;
        } else {
            console.log(`ℹ️  No changes: ${file}`);
        }
    } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
        errorCount++;
    }
});

console.log(`\n📊 Summary:`);
console.log(`✅ Files cleaned: ${cleanedCount}`);
console.log(`ℹ️  Files unchanged: ${filesToClean.length - cleanedCount - errorCount}`);
console.log(`❌ Errors: ${errorCount}`);
