-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('rider', 'renter', 'both', 'admin');

-- CreateEnum
CREATE TYPE "booking_status" AS ENUM ('requested', 'confirmed', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "listing_status" AS ENUM ('active', 'paused');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "date_of_birth" DATE,
ADD COLUMN     "home_city" VARCHAR(80),
ADD COLUMN     "id_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" "user_role" NOT NULL DEFAULT 'both',
ALTER COLUMN "full_name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(254),
ALTER COLUMN "password_hash" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "phone" SET DATA TYPE VARCHAR(30);

-- AlterTable
ALTER TABLE "vehicle_types" ALTER COLUMN "type_name" SET DATA TYPE VARCHAR(40);

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "allowed_use" VARCHAR(20) NOT NULL DEFAULT 'both',
ALTER COLUMN "model" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "model_year" SET DATA TYPE SMALLINT;

-- CreateTable
CREATE TABLE "listings" (
    "listing_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vehicle_id" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "daily_rate" DECIMAL(10,2) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "pickup_city" VARCHAR(80) NOT NULL,
    "pickup_address" VARCHAR(255) NOT NULL,
    "pickup_area" VARCHAR(120),
    "pickup_lat" DECIMAL(9,6),
    "pickup_lng" DECIMAL(9,6),
    "listing_status" "listing_status" NOT NULL DEFAULT 'paused',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("listing_id")
);

-- CreateTable
CREATE TABLE "listing_photos" (
    "photo_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "photo_url" VARCHAR(500) NOT NULL,
    "sort_order" SMALLINT NOT NULL DEFAULT 0,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "listing_photos_pkey" PRIMARY KEY ("photo_id")
);

-- CreateTable
CREATE TABLE "availability_blocks" (
    "block_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "start_at" TIMESTAMPTZ(6) NOT NULL,
    "end_at" TIMESTAMPTZ(6) NOT NULL,
    "reason" VARCHAR(120),

    CONSTRAINT "availability_blocks_pkey" PRIMARY KEY ("block_id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "booking_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "rider_id" UUID NOT NULL,
    "start_at" TIMESTAMPTZ(6) NOT NULL,
    "end_at" TIMESTAMPTZ(6) NOT NULL,
    "status" "booking_status" NOT NULL DEFAULT 'requested',
    "approved_at" TIMESTAMPTZ(6),
    "daily_rate_at_booking" DECIMAL(10,2) NOT NULL,
    "service_fee" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "payments" (
    "payment_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "stripe_payment_id" VARCHAR(120) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "paid_at" TIMESTAMPTZ(6),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "messages" (
    "message_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "sent_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "review_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "reviewee_id" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("review_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "listings_vehicle_id_key" ON "listings"("vehicle_id");

-- CreateIndex
CREATE INDEX "listings_listing_status_pickup_city_idx" ON "listings"("listing_status", "pickup_city");

-- CreateIndex
CREATE INDEX "listing_photos_listing_id_idx" ON "listing_photos"("listing_id");

-- CreateIndex
CREATE INDEX "availability_blocks_listing_start_end_idx" ON "availability_blocks"("listing_id", "start_at", "end_at");

-- CreateIndex
CREATE INDEX "bookings_listing_start_end_idx" ON "bookings"("listing_id", "start_at", "end_at");

-- CreateIndex
CREATE INDEX "bookings_rider_id_idx" ON "bookings"("rider_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripe_payment_id_key" ON "payments"("stripe_payment_id");

-- CreateIndex
CREATE INDEX "payments_booking_id_idx" ON "payments"("booking_id");

-- CreateIndex
CREATE INDEX "messages_booking_sent_at_idx" ON "messages"("booking_id", "sent_at");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "reviews_reviewee_id_idx" ON "reviews"("reviewee_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_booking_id_reviewer_id_key" ON "reviews"("booking_id", "reviewer_id");

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_vehicle_fk" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("vehicle_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_photos" ADD CONSTRAINT "listing_photos_listing_fk" FOREIGN KEY ("listing_id") REFERENCES "listings"("listing_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_blocks" ADD CONSTRAINT "availability_blocks_listing_fk" FOREIGN KEY ("listing_id") REFERENCES "listings"("listing_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_listing_fk" FOREIGN KEY ("listing_id") REFERENCES "listings"("listing_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_rider_fk" FOREIGN KEY ("rider_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_fk" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_booking_fk" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_fk" FOREIGN KEY ("sender_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_fk" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_fk" FOREIGN KEY ("reviewer_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewee_fk" FOREIGN KEY ("reviewee_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "vehicles" DROP CONSTRAINT "vehicles_owner_fk";
ALTER TABLE "vehicles"
ADD CONSTRAINT "vehicles_owner_fk" FOREIGN KEY ("owner_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "vehicles" DROP CONSTRAINT "vehicles_type_fk";
ALTER TABLE "vehicles"
ADD CONSTRAINT "vehicles_type_fk" FOREIGN KEY ("type_id") REFERENCES "vehicle_types"("type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_rating_check" CHECK ("rating" BETWEEN 1 AND 5);

ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_time_window_check" CHECK ("end_at" > "start_at");

ALTER TABLE "availability_blocks"
ADD CONSTRAINT "availability_blocks_time_window_check" CHECK ("end_at" > "start_at");

ALTER TABLE "listings"
ADD CONSTRAINT "listings_pickup_lat_check" CHECK ("pickup_lat" IS NULL OR "pickup_lat" BETWEEN -90 AND 90),
ADD CONSTRAINT "listings_pickup_lng_check" CHECK ("pickup_lng" IS NULL OR "pickup_lng" BETWEEN -180 AND 180);
