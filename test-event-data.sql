-- Test Event Data for Event Manager Features Demo
-- Run this to create a sample event with tickets and bookings

-- Insert a test event (adjust organizer_id if needed)
INSERT INTO events (
    name, description, category, type, status, 
    start_date_time, end_date_time,
    venue_name, venue_address, venue_city, venue_country,
    cover_image, organizer_id, slug,
    created_at, updated_at
) VALUES (
    'Tech Conference 2024',
    'Annual technology conference featuring latest innovations in AI, Cloud Computing, and Web Development. Join industry leaders and network with fellow developers.',
    'CONFERENCE',
    'IN_PERSON',
    'PUBLISHED',
    '2024-12-30 09:00:00',
    '2024-12-30 18:00:00',
    'Grand Convention Center',
    '123 Main Street',
    'Kathmandu',
    'Nepal',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
    1, -- Change this to match your organizer/admin user ID
    'tech-conference-2024',
    NOW(),
    NOW()
);

-- Get the event ID (assuming it's the last inserted)
SET @event_id = LAST_INSERT_ID();

-- Insert ticket types
INSERT INTO ticket_types (
    event_id, name, description, price, quantity, quantity_sold,
    sale_start_date, sale_end_date, min_quantity_per_order, max_quantity_per_order,
    active, created_at
) VALUES
    (@event_id, 'Early Bird', 'Special early bird discount', 999.00, 50, 35, NOW(), '2024-12-29 23:59:59', 1, 5, true, NOW()),
    (@event_id, 'Regular', 'Standard admission ticket', 1499.00, 100, 62, NOW(), '2024-12-29 23:59:59', 1, 10, true, NOW()),
    (@event_id, 'VIP', 'VIP access with exclusive perks', 2999.00, 20, 15, NOW(), '2024-12-29 23:59:59', 1, 3, true, NOW());

-- Optional: Create some sample bookings (if you want to see analytics data)
-- Note: You'll need to adjust user_id and attendee data as needed

INSERT INTO bookings (
    event_id, user_id, booking_reference, status,
    total_amount, payment_status, payment_method,
    booking_date, created_at, updated_at
) VALUES
    (@event_id, 1, 'BK001', 'CONFIRMED', 2998.00, 'COMPLETED', 'ESEWA', NOW(), NOW(), NOW()),
    (@event_id, 1, 'BK002', 'CONFIRMED', 4497.00, 'COMPLETED', 'KHALTI', NOW(), NOW(), NOW());

-- Verify the event was created
SELECT 
    id, name, category, status, 
    DATE_FORMAT(start_date_time, '%Y-%m-%d %H:%i') as event_date,
    venue_name
FROM events 
WHERE id = @event_id;

-- Verify ticket types
SELECT id, name, price, quantity, quantity_sold 
FROM ticket_types 
WHERE event_id = @event_id;
