/**
 * Quick test to verify /api/hotels/cities endpoint
 * Run this with: node test-hotels-cities.js
 */

const API_BASE_URL = 'http://localhost:8080';

async function testCitiesEndpoint() {
    console.log('Testing /api/hotels/cities endpoint...\n');

    try {
        const response = await fetch(`${API_BASE_URL}/api/hotels/cities`);

        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Content-Type:', response.headers.get('content-type'));
        console.log('');

        const data = await response.json();

        console.log('Raw Response:');
        console.log(JSON.stringify(data, null, 2));
        console.log('');

        // Check response structure
        if (data && typeof data === 'object') {
            if (data.data) {
                console.log('Response wrapped in { data } structure');
                console.log('Cities:', data.data);
                console.log('Is array?:', Array.isArray(data.data));
                console.log('Length:', data.data?.length || 0);
            } else if (Array.isArray(data)) {
                console.log('Response is direct array');
                console.log('Cities:', data);
                console.log('Length:', data.length);
            } else {
                console.log('Unexpected response structure');
            }
        }

        console.log('\n✅ Test completed successfully');

    } catch (error) {
        console.error('❌ Error testing endpoint:', error.message);
        if (error.cause) {
            console.error('Cause:', error.cause);
        }
    }
}

testCitiesEndpoint();
