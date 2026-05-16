package com.businessshowcase.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Konfiguracija storage-a (S3-compatible: MinIO/R2/S3).
 * Mapira se na {@code app.storage.*} u application.yml.
 */
@ConfigurationProperties(prefix = "app.storage")
public record StorageProperties(
        String endpoint,
        String region,
        String bucket,
        String accessKey,
        String secretKey,
        String publicUrlBase,
        boolean pathStyleAccess
) {}
