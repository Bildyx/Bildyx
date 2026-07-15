-- Tracks the content hash of every imported CSV row, per reference-data
-- model, so the incremental Excel/CSV -> DB import engine
-- (apps/api/prisma/import/) can tell inserts, targeted updates, and
-- unchanged rows apart without touching the 11 business tables themselves.
-- CreateTable
CREATE TABLE "import_row_hashes" (
    "id" UUID NOT NULL,
    "model_name" TEXT NOT NULL,
    "natural_key" TEXT NOT NULL,
    "row_hash" TEXT NOT NULL,
    "last_imported_at" TIMESTAMP(3) NOT NULL,
    "source_file" TEXT,

    CONSTRAINT "import_row_hashes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "import_row_hashes_model_name_natural_key_key" ON "import_row_hashes"("model_name", "natural_key");
