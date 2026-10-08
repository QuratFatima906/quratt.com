ALTER TABLE "projects" ADD COLUMN "goal" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "repo" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "video" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "body" text;