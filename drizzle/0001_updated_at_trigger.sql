-- `updated_at` is maintained here rather than in application code: it feeds `dateModified` in
-- the structured data and `lastModified` in the sitemap, and both must stay true when a row is
-- changed by a migration, a psql session, or anything else that is not the app.
--
-- The WHEN clause keeps a no-op UPDATE — a re-run of the seed, say — from bumping the stamp.
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE OR REPLACE TRIGGER "about_set_updated_at"
  BEFORE UPDATE ON "about"
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE OR REPLACE TRIGGER "contact_set_updated_at"
  BEFORE UPDATE ON "contact"
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE OR REPLACE TRIGGER "now_meta_set_updated_at"
  BEFORE UPDATE ON "now_meta"
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE OR REPLACE TRIGGER "now_set_updated_at"
  BEFORE UPDATE ON "now"
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE OR REPLACE TRIGGER "projects_set_updated_at"
  BEFORE UPDATE ON "projects"
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE OR REPLACE TRIGGER "posts_set_updated_at"
  BEFORE UPDATE ON "posts"
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE OR REPLACE TRIGGER "talks_set_updated_at"
  BEFORE UPDATE ON "talks"
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE OR REPLACE TRIGGER "shelf_set_updated_at"
  BEFORE UPDATE ON "shelf"
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE OR REPLACE TRIGGER "uses_set_updated_at"
  BEFORE UPDATE ON "uses"
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE OR REPLACE TRIGGER "cv_set_updated_at"
  BEFORE UPDATE ON "cv"
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION set_updated_at();
