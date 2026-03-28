package es.upm.tfg.thesisplatform.storage;

import org.springframework.web.multipart.MultipartFile;

/**
 * Abstraction for file storage operations in the platform.
 *
 * <p>
 * This interface defines the contract for storing uploaded files
 * (such as CVs) in different storage implementations (local, cloud, etc.).
 * </p>
 */
public interface FileStorageService {

    /**
     * Saves a file in the specified subdirectory.
     *
     * @param file         file uploaded by the user
     * @param subdirectory logical subfolder where the file will be stored
     * @return public URL or reference to the stored file
     */
    String saveFile(MultipartFile file, String subdirectory);
}