package com.businessshowcase.storage;

import com.businessshowcase.common.exception.StorageException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.PutBucketPolicyRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.util.UUID;

/**
 * S3-compatible implementacija. Radi sa MinIO, R2, B2, AWS S3 - bilo čime
 * što govori S3 protokol.
 *
 * Validacija fajlova nije ovdje - radi se uzvodno (vidi {@link ImageProcessor}).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class S3StorageService implements StorageService {

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
     * Idempotentno - bezbjedno se poziva pri svakom pokretanju.
     * Na Cloudflare R2 ovo fail-uje (R2 ne podržava bucket policy API) - to je OK,
     * publicity se kontroliše preko R2.dev subdomain-a ili custom domena.
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
                    "Provjeri da bucket ima omogucen javni pristup (R2.dev subdomain ili custom domain).",
                    e.getMessage());
        }
    }

    @Override
    public UploadedFile uploadBytes(byte[] data, String contentType, String filenameHint, String folder) {
        String key = "%s/%s-%s".formatted(
                folder,
                UUID.randomUUID(),
                sanitizeFilename(filenameHint));

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(props.bucket())
                    .key(key)
                    .contentType(contentType)
                    .contentLength((long) data.length)
                    .build();

            s3Client.putObject(request, RequestBody.fromBytes(data));

            String url = buildPublicUrl(key);
            log.info("Upload {}KB -> {}", data.length / 1024, key);
            return new UploadedFile(key, url);

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
            log.warn("Greska pri brisanju fajla {} - ignorisem ({}).", key, e.getMessage());
        }
    }

    private String sanitizeFilename(String filename) {
        if (filename == null || filename.isBlank()) return "file";
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
