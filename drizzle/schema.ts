import { desc, relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const recipientContactTypeEnum = pgEnum("RecipientContactType", [
  "email",
  "phone",
]);

export const requestStatusEnum = pgEnum("RequestStatus", [
  "Pending",
  "Paid",
  "Declined",
  "Cancelled",
  "Expired",
]);

export const users = pgTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull(),
    phone: text("phone"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("users_email_key").on(table.email),
    uniqueIndex("users_phone_key").on(table.phone),
  ],
);

export const paymentRequests = pgTable(
  "payment_requests",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    senderUserId: text("sender_user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    recipientContactType: recipientContactTypeEnum("recipient_contact_type").notNull(),
    recipientContactValue: text("recipient_contact_value").notNull(),
    recipientMatchedUserId: text("recipient_matched_user_id").references(
      () => users.id,
      {
        onDelete: "set null",
      },
    ),
    amountCents: integer("amount_cents").notNull(),
    currencyCode: text("currency_code").notNull().default("USD"),
    note: text("note"),
    status: requestStatusEnum("status").notNull().default("Pending"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    paidAt: timestamp("paid_at", { mode: "date" }),
    declinedAt: timestamp("declined_at", { mode: "date" }),
    cancelledAt: timestamp("cancelled_at", { mode: "date" }),
    lastStatusChangedAt: timestamp("last_status_changed_at", {
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("payment_requests_sender_user_id_created_at_idx").on(
      table.senderUserId,
      desc(table.createdAt),
    ),
    index("payment_requests_recipient_matched_user_id_created_at_idx").on(
      table.recipientMatchedUserId,
      desc(table.createdAt),
    ),
    index("payment_requests_status_expires_at_idx").on(
      table.status,
      table.expiresAt,
    ),
    index("payment_requests_recipient_contact_value_status_idx").on(
      table.recipientContactValue,
      table.status,
    ),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  matchedIncomingRequests: many(paymentRequests, {
    relationName: "paymentRequestRecipientMatch",
  }),
  outgoingRequests: many(paymentRequests, {
    relationName: "paymentRequestSender",
  }),
}));

export const paymentRequestsRelations = relations(paymentRequests, ({ one }) => ({
  recipientMatchedUser: one(users, {
    fields: [paymentRequests.recipientMatchedUserId],
    references: [users.id],
    relationName: "paymentRequestRecipientMatch",
  }),
  sender: one(users, {
    fields: [paymentRequests.senderUserId],
    references: [users.id],
    relationName: "paymentRequestSender",
  }),
}));

export type User = typeof users.$inferSelect;
export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type NewPaymentRequest = typeof paymentRequests.$inferInsert;
export type RequestStatus = (typeof requestStatusEnum.enumValues)[number];
export type RecipientContactType = (typeof recipientContactTypeEnum.enumValues)[number];
