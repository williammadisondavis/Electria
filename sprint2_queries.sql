
-- Electria Sprint #2
-- Teammate 3: Vehicle Queries

-- =========================================
-- Query 1: Find Vehicles by Type
-- =========================================

-- Display all electric scooters
SELECT
    v.vehicle_id,
    v.brand,
    v.model,
    vt.type_name
FROM public.vehicle AS v
JOIN public.vehicle_type AS vt
    ON v.type_id = vt.type_id
WHERE LOWER(vt.type_name) = 'e-scooter';


-- =========================================
-- Query 2: Find Vehicles Below $30
-- =========================================

-- Display vehicles renting for less than $30 per day
SELECT
    v.vehicle_id,
    v.brand,
    v.model,
    l.daily_rate
FROM public.vehicle AS v
JOIN public.listing AS l
    ON v.vehicle_id = l.vehicle_id
WHERE l.daily_rate < 30
ORDER BY l.daily_rate ASC;


-- =========================================
-- Query 3: Count Total Vehicles
-- =========================================

-- Display the total number of vehicles
SELECT
    COUNT(*) AS total_vehicles
FROM public.vehicle;
