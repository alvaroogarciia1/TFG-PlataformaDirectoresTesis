package es.upm.tfg.thesisplatform.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import es.upm.tfg.thesisplatform.exception.InvalidFileException;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class LocalFileStorageService implements FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Value("${app.base-url}")
    private String baseUrl;

    @Override
    public String saveFile(MultipartFile file, String subdirectory) {
        try {
            if (file.isEmpty()) {
                throw new InvalidFileException("File is empty");
            }

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
                throw new InvalidFileException("Only PDF files are allowed");
            }

            if (file.getSize() > 5_000_000) {
                throw new InvalidFileException("File size must not exceed 5 MB");
            }

            String safeFilename = UUID.randomUUID() + "_" + originalFilename.replaceAll("\\s+", "_");

            Path uploadPath = Paths.get(uploadDir, subdirectory);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(safeFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return baseUrl + "/files/" + subdirectory + "/" + safeFilename;

        } catch (IOException e) {
            throw new RuntimeException("Error saving file", e);
        }
    }
}