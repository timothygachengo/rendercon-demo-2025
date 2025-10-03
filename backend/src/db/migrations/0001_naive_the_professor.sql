CREATE TABLE "auth_challenges" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"challenge" text NOT NULL,
	"type" text NOT NULL,
	"created_at" text NOT NULL,
	"expires_at" text NOT NULL,
	"registration_options" text
);
--> statement-breakpoint
CREATE TABLE "user_passkeys" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"credential_id" text NOT NULL,
	"public_key" text NOT NULL,
	"counter" integer DEFAULT 0 NOT NULL,
	"platform" text NOT NULL,
	"last_used" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"revoked_at" text,
	"revoked_reason" text,
	"metadata" text,
	"aaguid" text,
	CONSTRAINT "user_passkeys_credential_id_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
DROP TABLE "auth_passkey" CASCADE;--> statement-breakpoint
DROP TABLE "passkey_challenge" CASCADE;--> statement-breakpoint
ALTER TABLE "user_passkeys" ADD CONSTRAINT "user_passkeys_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;