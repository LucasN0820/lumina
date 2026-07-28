-- Store the requested render tier and device-local likes for the polished library experience.
ALTER TABLE "wallpaper" ADD COLUMN "quality" TEXT NOT NULL DEFAULT 'hd';
ALTER TABLE "wallpaper" ADD COLUMN "favorite" BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX "wallpaper_device_id_favorite_idx" ON "wallpaper"("device_id", "favorite");
