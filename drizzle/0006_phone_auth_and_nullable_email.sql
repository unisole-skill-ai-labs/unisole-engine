-- Add 'phone' to auth_provider enum if not present
ALTER TYPE "public"."auth_provider" ADD VALUE IF NOT EXISTS 'phone';

-- Make email nullable on users table
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;

-- Ensure phone column length is varchar(20)
ALTER TABLE "users" ALTER COLUMN "phone" TYPE varchar(20);
