-- Editable kontakt podaci. Singleton tabela - uvijek tačno jedan red (id=1).
-- CHECK constraint sprečava insert dodatnih redova.
CREATE TABLE business_contact (
    id              BIGINT       PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    phone           VARCHAR(50),
    email           VARCHAR(255),
    address         VARCHAR(255),
    city            VARCHAR(100),
    working_hours   VARCHAR(255),
    instagram_url   VARCHAR(500),
    facebook_url    VARCHAR(500),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Inicijalne vrijednosti (placeholder-i za prvi run - admin ih mijenja kroz UI)
INSERT INTO business_contact (
    id, phone, email, address, city, working_hours, instagram_url, facebook_url
) VALUES (
    1,
    '+387 00 000 000',
    'info@sikanjic.ba',
    'Ulica i broj bb',
    'Grad',
    'Pon - Pet: 08:00 - 17:00 · Sub: 09:00 - 13:00',
    'https://instagram.com/',
    ''
);

COMMENT ON TABLE business_contact IS 'Editable kontakt podaci - menja se kroz /admin/postavke';
