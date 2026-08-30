CREATE TABLE "community" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"badge" text NOT NULL,
	"org" text NOT NULL,
	"role" text NOT NULL,
	"period" text NOT NULL,
	"note" text NOT NULL,
	"body" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_meta" (
	"id" integer PRIMARY KEY NOT NULL,
	"intro" text NOT NULL,
	"kicker" text NOT NULL,
	"lesson1" text NOT NULL,
	"lesson2" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Appended by hand: `drizzle-kit generate` writes the table, not the `updated_at` trigger from
-- 0001. Without these two the community rows would report their seed time forever, and both
-- `dateModified` and the sitemap's `lastModified` would quietly lie about /community.
CREATE OR REPLACE TRIGGER "community_meta_set_updated_at"
  BEFORE UPDATE ON "community_meta"
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE OR REPLACE TRIGGER "community_set_updated_at"
  BEFORE UPDATE ON "community"
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION set_updated_at();
