ALTER TABLE "module_item" ADD COLUMN IF NOT EXISTS "module_id" text REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'module_lessons') THEN
    UPDATE "module_item" mi
    SET "module_id" = ml."module_id"
    FROM "module_lessons" ml
    WHERE ml."module_item_id" = mi."id";
    
    DROP TABLE "module_lessons";
  END IF;
END $$;
