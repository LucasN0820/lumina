-- Add anonymous-device ownership for the MVP generation history.
ALTER TABLE "wallpaper" ADD COLUMN "device_id" TEXT;

-- Keep device-scoped history queries efficient while Clerk authentication is deferred.
CREATE INDEX "wallpaper_device_id_idx" ON "wallpaper"("device_id");
