package es.upm.tfg.thesisplatform.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import es.upm.tfg.thesisplatform.exception.InvalidFileException;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

/**
 * Local filesystem implementation of {@link FileStorageService}.
 *
 * <p>
 * This service stores uploaded files in a directory within the server
 * and returns a public URL for later access.
 * </p>
 *
 * <p>
 * It also performs validation on file type and size.
 * </p>
 */
@Service
public class LocalFileStorageService implements FileStorageService {

    /**
     * Base directory where files are stored on disk.
     */
    @Value("${app.upload.dir}")
    private String uploadDir;

    /**
     * Base URL used to expose stored files publicly.
     */
    @Value("${app.base-url}")
    private String baseUrl;

    /**
     * Saves a file in the local filesystem after validating it.
     *
     * @param file         uploaded file
     * @param subdirectory logical subfolder
     * @return public URL of the stored file
     * @throws InvalidFileException if validation fails
     */
    @Override
    public String saveFile(MultipartFile file, String subdirectory) {
        try {
            if (file.isEmpty()) {
                throw new InvalidFileException("File is empty");
            }

            String contentType = file.getContentType();
            if (!"application/pdf".equals(contentType)) {
                throw new InvalidFileException("Only PDF files are allowed");
            }

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
                throw new InvalidFileException("Only PDF files are allowed");
            }

            if (file.getSize() > 5_000_000) {
                throw new InvalidFileException("File size must not exceed 5 MB");
            }

            // Generate unique safe filename
            String safeFilename = UUID.randomUUID() + "_" + originalFilename.replaceAll("\\s+", "_");

            Path uploadPath = Paths.get(uploadDir, subdirectory);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(safeFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

           return subdirectory + "/" + safeFilename;

        } catch (IOException e) {
            throw new RuntimeException("Error saving file", e);
        }
    }
}