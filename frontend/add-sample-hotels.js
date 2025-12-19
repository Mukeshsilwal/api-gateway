/**
 * Add Sample Hotels to Database
 * This script creates sample hotels in different cities to populate the dropdown
 * Run: node add-sample-hotels.js
 */

const API_BASE_URL = 'http://localhost:8080';

// Sample hotels with realistic Nepal data
const sampleHotels = [
    {
        name: "Hotel Himalaya Heritage",
        description: "Luxury 5-star hotel in the heart of Kathmandu with stunning mountain views",
        address: "Kupondole, Lalitpur",
        city: "Kathmandu",
        country: "Nepal",
        zipCode: "44600",
        hotelCode: "HHH-001",
        email: "info@hotelhimalayaheritage.com",
        phone: "+977-1-5551234",
        stars: 5,
        rating: 4.7,
        images: [],
        hotelImageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
        latitude: 27.6915,
        longitude: 85.3240,
        website: "https://www.hotelhimalayaheritage.com",
        amenities: ["Free WiFi", "Swimming Pool", "Spa", "Fitness Center", "Restaurant", "Bar", "24/7 Room Service", "Airport Shuttle", "Business Center", "Parking"],
        featured: true
    },
    {
        name: "Pokhara Lake View Hotel",
        description: "Beautiful lakeside hotel with panoramic views of Phewa Lake and Annapurna range",
        address: "Lakeside, Baidam",
        city: "Pokhara",
        country: "Nepal",
        zipCode: "33700",
        hotelCode: "PLV-002",
        email: "contact@pokharalakeview.com",
        phone: "+977-61-465123",
        stars: 4,
        rating: 4.5,
        images: [],
        hotelImageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d",
        latitude: 28.2096,
        longitude: 83.9856,
        website: "https://www.pokharalakeview.com",
        amenities: ["Free WiFi", "Lake View", "Restaurant", "Garden", "Parking", "Boat Rental"],
        featured: true
    },
    {
        name: "Chitwan Jungle Lodge",
        description: "Eco-friendly resort in the heart of Chitwan National Park",
        address: "Sauraha, Chitwan",
        city: "Chitwan",
        country: "Nepal",
        zipCode: "44200",
        hotelCode: "CJL-003",
        email: "info@chitwanjunglelodge.com",
        phone: "+977-56-580123",
        stars: 3,
        rating: 4.3,
        images: [],
        hotelImageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",
        latitude: 27.5796,
        longitude: 84.4942,
        website: "https://www.chitwanjunglelodge.com",
        amenities: ["Free WiFi", "Jungle Safari", "Restaurant", "Nature Tours", "Parking"],
        featured: false
    },
    {
        name: "Lumbini Garden Hotel",
        description: "Peaceful hotel near the birthplace of Buddha",
        address: "Lumbini Development Trust Road",
        city: "Lumbini",
        country: "Nepal",
        zipCode: "32900",
        hotelCode: "LGH-004",
        email: "stay@lumbinigarden.com",
        phone: "+977-71-580234",
        stars: 3,
        rating: 4.2,
        images: [],
        hotelImageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
        latitude: 27.4833,
        longitude: 83.2764,
        website: "https://www.lumbinigarden.com",
        amenities: ["Free WiFi", "Garden", "Restaurant", "Meditation Room", "Parking"],
        featured: false
    },
    {
        name: "Kathmandu Budget Inn",
        description: "Affordable and comfortable stay in Thamel",
        address: "Thamel, Kathmandu",
        city: "Kathmandu",
        country: "Nepal",
        zipCode: "44600",
        hotelCode: "KBI-005",
        email: "contact@ktmbudgetinn.com",
        phone: "+977-1-4701234",
        stars: 2,
        rating: 4.0,
        images: [],
        hotelImageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791",
        latitude: 27.7172,
        longitude: 85.3240,
        website: "https://www.ktmbudgetinn.com",
        amenities: ["Free WiFi", "Restaurant", "Rooftop Terrace"],
        featured: false
    }
];

async function addHotel(hotel, index) {
    try {
        console.log(`\n[${index + 1}/${sampleHotels.length}] Adding: ${hotel.name} (${hotel.city})`);

        const response = await fetch(`${API_BASE_URL}/api/hotels`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add auth token if required
                // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
            },
            body: JSON.stringify(hotel)
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`✅ Success: ${hotel.name} added`);
            console.log(`   Hotel ID: ${data.data?.id || data.id || 'N/A'}`);
        } else {
            console.log(`❌ Failed: ${hotel.name}`);
            console.log(`   Status: ${response.status}`);
            console.log(`   Error: ${data.message || JSON.stringify(data)}`);
        }

        return { success: response.ok, hotel: hotel.name, data };

    } catch (error) {
        console.log(`❌ Error adding ${hotel.name}:`, error.message);
        return { success: false, hotel: hotel.name, error: error.message };
    }
}

async function addAllHotels() {
    console.log('========================================');
    console.log('  Adding Sample Hotels to Database');
    console.log('========================================');
    console.log(`Total hotels to add: ${sampleHotels.length}`);
    console.log(`Target API: ${API_BASE_URL}/api/hotels`);

    const results = [];

    // Add hotels sequentially to avoid overwhelming the server
    for (let i = 0; i < sampleHotels.length; i++) {
        const result = await addHotel(sampleHotels[i], i);
        results.push(result);

        // Small delay between requests
        if (i < sampleHotels.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    // Summary
    console.log('\n========================================');
    console.log('  Summary');
    console.log('========================================');
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);

    if (successful > 0) {
        console.log('\n✨ Hotels added successfully!');
        console.log('   The cities dropdown should now show:');
        const uniqueCities = [...new Set(sampleHotels.map(h => h.city))];
        uniqueCities.forEach(city => console.log(`   - ${city}`));
    }

    console.log('\n========================================');
}

// Run the script
addAllHotels().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
