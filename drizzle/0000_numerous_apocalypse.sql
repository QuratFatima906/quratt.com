CREATE TABLE "about" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"meta" text NOT NULL,
	"bio1" text NOT NULL,
	"bio2" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact" (
	"id" integer PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"note" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cv" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"period" text NOT NULL,
	"role" text NOT NULL,
	"note" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "now" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"line" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "now_meta" (
	"id" integer PRIMARY KEY NOT NULL,
	"now_updated" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"blurb" text NOT NULL,
	"date" text NOT NULL,
	"mins" text NOT NULL,
	"body" text,
	"canonical" text,
	"draft" boolean DEFAULT false NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"year" text NOT NULL,
	"lang" text NOT NULL,
	"tag" text NOT NULL,
	"desc" text NOT NULL,
	"draft" boolean DEFAULT false NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shelf" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title" text NOT NULL,
	"state" text NOT NULL,
	"note" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "talks" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title" text NOT NULL,
	"venue" text NOT NULL,
	"year" text NOT NULL,
	"links" text NOT NULL,
	"draft" boolean DEFAULT false NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "uses" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL
);
