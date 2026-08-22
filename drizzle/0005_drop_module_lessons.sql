ALTER TABLE "module_item" ADD COLUMN "module_id" text NOT NULL REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;

UPDATE "module_item" mi
SET "module_id" = ml."module_id"
FROM "module_lessons" ml
WHERE ml."module_item_id" = mi."id";

DROP TABLE "module_lessons";
