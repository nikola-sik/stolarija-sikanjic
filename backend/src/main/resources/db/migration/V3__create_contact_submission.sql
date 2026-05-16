-- Upiti sa contact forme
CREATE TABLE contact_submission (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(50),
    topic           VARCHAR(50),
    message         TEXT         NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'NEW',
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(500),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contact_status ON contact_submission(status);
CREATE INDEX idx_contact_created_at ON contact_submission(created_at DESC);

COMMENT ON TABLE contact_submission IS 'Upiti sa javne contact forme';
COMMENT ON COLUMN contact_submission.status IS 'NEW | READ | RESOLVED | ARCHIVED';
COMMENT ON COLUMN contact_submission.ip_address IS 'IP adresa za spam tracking - poštujemo GDPR, čuva se 30 dana';
