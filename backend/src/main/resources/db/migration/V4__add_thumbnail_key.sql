-- Dodaje thumbnail_key kolonu za brisanje thumbnail-a iz storage-a pri delete-u
-- Postojeci redovi ce imati NULL - to je OK, oni nemaju thumbnail
ALTER TABLE gallery_item
    ADD COLUMN thumbnail_key VARCHAR(500);

COMMENT ON COLUMN gallery_item.thumbnail_key IS 'S3 objekt ključ za thumbnail - omogućava brisanje pri delete-u';
