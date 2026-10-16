-- Query 1: List vehicles with the main listing details needed for browsing available rentals.
SELECT
    v.vehicle_id,
    vt.type_name AS vehicle_category,
    v.brand,
    v.model,
    v.model_year,
    v.description,
    v.condition_status AS condition_status
FROM
    vehicles AS v
    JOIN vehicle_types AS vt ON vt.type_id = v.type_id
ORDER BY
    vt.type_name,
    v.brand,
    v.model;

-- Query 2: Show each vehicle with its owner name and category so listings can be reviewed without exposing contact details or password data.
SELECT
    v.vehicle_id,
    u.full_name AS owner_name,
    vt.type_name AS vehicle_category,
    v.brand,
    v.model,
    v.model_year,
    v.description,
    v.condition_status AS condition_status
FROM
    vehicles AS v
    INNER JOIN users AS u ON u.user_id = v.owner_id
    INNER JOIN vehicle_types AS vt ON vt.type_id = v.type_id
ORDER BY
    u.full_name,
    v.brand,
    v.model;

-- Query 3: Filter vehicles by category
-- Change 'e-bike' to 'e-scooter' or 'e-skateboard' to view another category.
SELECT
    v.vehicle_id,
    vt.type_name AS vehicle_category,
    u.full_name AS owner_name,
    v.brand,
    v.model,
    v.model_year,
    v.description,
    v.condition_status AS condition_status
FROM
    vehicles AS v
    INNER JOIN vehicle_types AS vt ON vt.type_id = v.type_id
    INNER JOIN users AS u ON u.user_id = v.owner_id
WHERE
    vt.type_name = 'e-bike'
ORDER BY
    v.brand,
    v.model;