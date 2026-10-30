-- SUPERSEDED by prisma/migrations. Retained as the legacy-schema baseline for
-- databases created before Prisma migrations were introduced.
-- Do not apply this file directly to a new database; use Prisma migrations.
-- Electria table definitions: Users, Vehicle Types, and Vehicles
-- PostgreSQL (Supabase). Column names match users.csv, vehicle_types.csv, and vehicles.csv.

CREATE TABLE users (
    user_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    password_hash   TEXT NOT NULL,
    phone           VARCHAR(20),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    account_status  VARCHAR(20) NOT NULL DEFAULT 'active',

    CONSTRAINT users_email_unique UNIQUE (email),
    CONSTRAINT users_account_status_check
        CHECK (account_status IN ('active', 'suspended', 'closed'))
);

CREATE TABLE vehicle_types (
    type_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_name       VARCHAR(50) NOT NULL,
    description     TEXT,

    CONSTRAINT vehicle_types_type_name_unique UNIQUE (type_name)
);

CREATE TABLE vehicles (
    vehicle_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id            UUID NOT NULL,
    type_id             UUID NOT NULL,
    brand               VARCHAR(100) NOT NULL,
    model               VARCHAR(100) NOT NULL,
    model_year          INTEGER,
    description         TEXT,
    condition_status    VARCHAR(20) NOT NULL,

    CONSTRAINT vehicles_owner_fk
        FOREIGN KEY (owner_id) REFERENCES users (user_id),
    CONSTRAINT vehicles_type_fk
        FOREIGN KEY (type_id) REFERENCES vehicle_types (type_id),
    CONSTRAINT vehicles_model_year_check
        CHECK (model_year IS NULL OR model_year BETWEEN 1990 AND 2100),
    CONSTRAINT vehicles_condition_status_check
        CHECK (condition_status IN ('excellent', 'good', 'fair', 'poor'))
);

CREATE INDEX vehicles_owner_id_idx ON vehicles (owner_id);
CREATE INDEX vehicles_type_id_idx ON vehicles (type_id);
