package com.businessshowcase.storage;

import com.businessshowcase.common.exception.BadRequestException;
import com.businessshowcase.common.exception.StorageException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.PutBucketPolicyRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

/**
 * S3-compatible implementacija. Radi sa MinIO, R2, B2, AWS S3 - bilo čime
 * što govori S3 protokol.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class S3StorageService implements StorageService {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    private final S3Client s3Client;
    private final StorageProperties props;

    @PostConstruct
    @Override
    public void initialize() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(props.bucket()).build());
            log.info("Storage bucket '{}' postoji", props.bucket());
        } catch (NoSuchBucketException e) {
            log.info("Bucket '{}' ne postoji - kreiram", props.bucket());
            try {
                s3Client.createBucket(CreateBucketRequest.builder().bucket(props.bucket()).build());
                log.info("Bucket '{}' uspjesno kreiran", props.bucket());
            } catch (Exception createEx) {
                log.error("Greska pri kreiranju bucket-a", createEx);
                return;
            }
        } catch (Exception e) {
            log.warn("Storage nije dostupan na pokretanju ({}). Aplikacija ce nastaviti " +
                    "ali upload nece raditi dok se storage ne ukljuci.", e.getMessage());
            return;
        }

        applyPublicReadPolicy();
    }

    /**
     * Postavlja bucket policy koji dozvoljava anonimno čitanje (download) objekata.
     * Bez ovoga, slike sa galerije nisu pristupne iz browsera (403 Forbidden).
     *
     * Idempotentno - bezbjedno se poziva pri svakom pokretanju.
     *
     * NAPOMENA: Za produkciju razmotri:
     *  - CloudFlare R2 + custom domain sa public access
     *  - ili CDN ispred storage-a
     *  - ili pre-signed URL-ove za osjetljive resurse
     */
    private void applyPublicReadPolicy() {
        String policy = """
                {
                  "Version": "2012-10-17",
                  "Statement": [
                    {
                      "Sid": "PublicReadGetObject",
                      "Effect": "Allow",
                      "Principal": "*",
                      "Action": "s3:GetObject",
                      "Resource": "arn:aws:s3:::%s/*"
                    }
                  ]
                }
                """.formatted(props.bucket());

        try {
            s3Client.putBucketPolicy(PutBucketPolicyRequest.builder()
                    .bucket(props.bucket())
                    .policy(policy)
                    .build());
            log.info("Public-read policy primijenjena na bucket '{}'", props.bucket());
        } catch (Exception e) {
            log.warn("Nije moguce postaviti bucket policy ({}). " +
                    "Slike mozda nece biti pristupne iz browsera. " +
                    "Postavi rucno: 'mc anonymous set download local/{}'",
                    e.getMessage(), props.bucket());
        }
    }

    @Override
    public UploadedFile upload(MultipartFile file, String folder) {
        validateFile(file);

        String key = "%s/%s-%s".formatted(
                folder,
                UUID.randomUUID(),
                sanitizeFilename(file.getOriginalFilename()));

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(props.bucket())
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            String url = buildPublicUrl(key);
            log.info("Uploadovan fajl: {} -> {}", file.getOriginalFilename(), key);
            return new UploadedFile(key, url);

        } catch (IOException e) {
            throw new StorageException("Greska pri citanju fajla", e);
        } catch (Exception e) {
            throw new StorageException("Greska pri upload-u: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(String key) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(props.bucket())
                    .key(key)
                    .build());
            log.info("Obrisan fajl: {}", key);
        } catch (Exception e) {
            log.warn("Greska pri brisanju fajla {} - ignorisem ({}). " +
                    "Orphan storage objekti se cikase tokom periodicnog cleanup-a.",
                    key, e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Fajl je prazan");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Fajl je veci od 10MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new BadRequestException("Tip fajla nije podrzan. Dozvoljeno: JPEG, PNG, WebP, GIF");
        }
    }

    private String sanitizeFilename(String filename) {
        if (filename == null) return "file";
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private String buildPublicUrl(String key) {
        String base = props.publicUrlBase();
        if (!base.endsWith("/")) {
            base += "/";
        }
        return base + key;
    }
}
