package es.upm.tfg.thesisplatform.storage;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String saveFile(MultipartFile file, String subdirectory);
}