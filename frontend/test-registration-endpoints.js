/**
 * Test Script for Ticket Katum Registration Module Endpoints
 * Run with: node test-registration-endpoints.js
 */

const BASE_URL = 'http://localhost:8080';

// Helper function to log test results
function logTest(name, status, data) {
    console.log('\n' + '='.repeat(60));
    console.log(`TEST: ${name}`);
    console.log('='.repeat(60));
    console.log(`Status: ${status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
}

// Test 1: Register Admin (multipart/form-data)
async function testRegisterAdmin() {
    try {
        const formData = new FormData();
        formData.append('fullName', 'John Doe');
        formData.append('email', 'johndoe@example.com');
        formData.append('phone', '9800000000');
        formData.append('address', 'Kathmandu');
        formData.append('role', 'ADMIN');

        // Note: For file upload, you'll need to provide an actual file
        // formData.append('document', fileBlob, 'document.pdf');

        const response = await fetch(`${BASE_URL}/register/admin`, {
            method: 'POST',
            body: formData
            // Note: Don't set Content-Type header, browser will set it with boundary
        });

        const data = await response.json();
        logTest('1. Register Admin', response.status, data);
        return data;
    } catch (error) {
        logTest('1. Register Admin', 'ERROR', { error: error.message });
        throw error;
    }
}

// Test 2: Get All Admin Requests
async function testGetAllRequests() {
    try {
        const response = await fetch(`${BASE_URL}/register/all-requests`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        logTest('2. Get All Admin Requests', response.status, data);
        return data;
    } catch (error) {
        logTest('2. Get All Admin Requests', 'ERROR', { error: error.message });
        throw error;
    }
}

// Test 3: Approve Admin Request
async function testApproveAdmin(requestId = 1) {
    try {
        const response = await fetch(`${BASE_URL}/register/approve/${requestId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        logTest(`3. Approve Admin Request (ID: ${requestId})`, response.status, data);
        return data;
    } catch (error) {
        logTest('3. Approve Admin Request', 'ERROR', { error: error.message });
        throw error;
    }
}

// Test 4: Send OTP
async function testSendOTP() {
    try {
        const response = await fetch(`${BASE_URL}/register/sent-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'johndoe'
            })
        });

        const data = await response.json();
        logTest('4. Send OTP', response.status, data);
        return data;
    } catch (error) {
        logTest('4. Send OTP', 'ERROR', { error: error.message });
        throw error;
    }
}

// Test 5: Change Password
async function testChangePassword() {
    try {
        const response = await fetch(`${BASE_URL}/register/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'johndoe',
                oldPassword: 'oldpass123',
                newPassword: 'newpass456'
            })
        });

        const data = await response.json();
        logTest('5. Change Password', response.status, data);
        return data;
    } catch (error) {
        logTest('5. Change Password', 'ERROR', { error: error.message });
        throw error;
    }
}

// Main test runner
async function runAllTests() {
    console.log('\n🚀 Starting Registration Module Endpoint Tests...\n');
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Time: ${new Date().toISOString()}\n`);

    try {
        // Test in logical order
        console.log('\n📋 Testing in order...\n');

        // First, get existing requests
        await testGetAllRequests();

        // Register a new admin (NOTE: You'll need to add file upload manually)
        // Uncomment when you have a file to upload
        // await testRegisterAdmin();
        console.log('\n⚠️  Skipping Register Admin test (requires file upload)');
        console.log('   To test: Use Postman or add file manually to the test');

        // Get requests again to see if new one was added
        await testGetAllRequests();

        // Approve an admin request (use ID from the list above)
        // await testApproveAdmin(1);
        console.log('\n⚠️  Skipping Approve Admin test (requires valid request ID)');
        console.log('   To test: Uncomment and replace with actual request ID');

        // Send OTP
        await testSendOTP();

        // Change password
        await testChangePassword();

        console.log('\n\n✅ All tests completed!\n');

    } catch (error) {
        console.error('\n\n❌ Test suite failed:', error.message);
        process.exit(1);
    }
}

// Run if executed directly
if (typeof window === 'undefined') {
    // Node.js environment
    runAllTests();
} else {
    // Browser environment
    console.log('Run runAllTests() in the browser console');
}

// Export for use in browser or other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testRegisterAdmin,
        testGetAllRequests,
        testApproveAdmin,
        testSendOTP,
        testChangePassword,
        runAllTests
    };
}
