-- Stavke galerije - slike radova
CREATE TABLE gallery_item (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    category        VARCHAR(50)  NOT NULL,
    image_url       VARCHAR(500) NOT NULL,
    thumbnail_url   VARCHAR(500),
    image_key       VARCHAR(500) NOT NULL,
    display_order   INTEGER      NOT NULL DEFAULT 0,
    featured        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gallery_category ON gallery_item(category);
CREATE INDEX idx_gallery_featured_order ON gallery_item(featured, display_order);
CREATE INDEX idx_gallery_created_at ON gallery_item(created_at DESC);

COMMENT ON TABLE gallery_item IS 'Slike radova - upload preko admin panela';
COMMENT ON COLUMN gallery_item.image_key IS 'S3 objekt ključ - potreban za brisanje iz storage-a';
