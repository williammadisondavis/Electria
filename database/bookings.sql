-- Basic Bookings table for Supabase.
-- Requires the vehicles table from sql/001_users_vehicle_types_vehicles.sql.
-- Run this in the Supabase SQL Editor, then screenshot the bookings table.

CREATE TABLE bookings (
    booking_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id      UUID NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    booking_status  VARCHAR(20) NOT NULL DEFAULT 'requested',

    CONSTRAINT bookings_vehicle_fk
        FOREIGN KEY (vehicle_id) REFERENCES vehicles (vehicle_id),
    CONSTRAINT bookings_date_window_check
        CHECK (end_date >= start_date),
    CONSTRAINT bookings_status_check
        CHECK (booking_status IN ('requested', 'confirmed', 'completed', 'cancelled'))
);

CREATE INDEX bookings_vehicle_id_idx ON bookings (vehicle_id);
