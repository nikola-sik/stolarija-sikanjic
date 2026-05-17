package com.businessshowcase.storage;

import com.businessshowcase.common.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Set;

/**
 * Obrađuje uploadovane slike — validira, resize-uje na max dimenzije,
 * generiše thumbnail i konvertuje u JPEG za bolju kompresiju.
 *
 * Tipično 5-50x smanjenje veličine bez vidljivog gubitka kvaliteta.
 *
 * Glavna slika: max 1920x1080, JPEG 85% kvalitet (oko 200-400KB)
 * Thumbnail:    max 400x400,   JPEG 80% kvalitet (oko 20-40KB)
 */
@Slf4j
@Service
public class ImageProcessor {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    private static final int MAIN_MAX_WIDTH = 1920;
    private static final int MAIN_MAX_HEIGHT = 1080;
    private static final float MAIN_QUALITY = 0.85f;

    private static final int THUMB_SIZE = 400;
    private static final float THUMB_QUALITY = 0.80f;

    private static final String OUTPUT_FORMAT = "jpg";
    private static final String OUTPUT_CONTENT_TYPE = "image/jpeg";

    /**
     * Validira fajl, generiše glavnu (resize) i thumbnail verziju.
     * Obje su konvertovane u JPEG za maksimalnu kompresiju.
     */
    public ProcessedImages process(MultipartFile file) {
        validate(file);

        try {
            byte[] original = file.getBytes();
            byte[] mainImage = resize(original, MAIN_MAX_WIDTH, MAIN_MAX_HEIGHT, MAIN_QUALITY);
            byte[] thumbnail = resize(original, THUMB_SIZE, THUMB_SIZE, THUMB_QUALITY);

            log.info("Procesovana slika '{}': original={}KB, glavna={}KB, thumb={}KB",
                    file.getOriginalFilename(),
                    original.length / 1024,
                    mainImage.length / 1024,
                    thumbnail.length / 1024);

            return new ProcessedImages(mainImage, thumbnail, OUTPUT_CONTENT_TYPE);

        } catch (IOException e) {
            throw new BadRequestException("Nije moguće obraditi sliku: " + e.getMessage());
        }
    }

    private byte[] resize(byte[] input, int maxWidth, int maxHeight, float quality)
            throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Thumbnails.of(new ByteArrayInputStream(input))
                .size(maxWidth, maxHeight)
                .outputFormat(OUTPUT_FORMAT)
                .outputQuality(quality)
                .toOutputStream(out);
        return out.toByteArray();
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Fajl je prazan");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Fajl je veći od 10MB");
        }
        String type = file.getContentType();
        if (type == null || !ALLOWED_IMAGE_TYPES.contains(type.toLowerCase())) {
            throw new BadRequestException(
                    "Tip fajla '%s' nije podržan. Dozvoljeno: JPEG, PNG, WebP, GIF"
                            .formatted(type));
        }
    }

    /**
     * @param mainImage   resize-ovana glavna slika (JPEG bytes)
     * @param thumbnail   thumbnail (JPEG bytes)
     * @param contentType MIME tip oba (uvijek "image/jpeg")
     */
    public record ProcessedImages(byte[] mainImage, byte[] thumbnail, String contentType) {}
}
