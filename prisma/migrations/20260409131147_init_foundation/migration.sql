-- CreateEnum
CREATE TYPE "RecipientContactType" AS ENUM ('email', 'phone');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('Pending', 'Paid', 'Declined', 'Cancelled', 'Expired');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_requests" (
    "id" TEXT NOT NULL,
    "sender_user_id" TEXT NOT NULL,
    "recipient_contact_type" "RecipientContactType" NOT NULL,
    "recipient_contact_value" TEXT NOT NULL,
    "recipient_matched_user_id" TEXT,
    "amount_cents" INTEGER NOT NULL,
    "note" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'Pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "declined_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "last_status_changed_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "payment_requests_sender_user_id_created_at_idx" ON "payment_requests"("sender_user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "payment_requests_recipient_matched_user_id_created_at_idx" ON "payment_requests"("recipient_matched_user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "payment_requests_status_expires_at_idx" ON "payment_requests"("status", "expires_at");

-- CreateIndex
CREATE INDEX "payment_requests_recipient_contact_value_status_idx" ON "payment_requests"("recipient_contact_value", "status");

-- AddForeignKey
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_sender_user_id_fkey" FOREIGN KEY ("sender_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_recipient_matched_user_id_fkey" FOREIGN KEY ("recipient_matched_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
