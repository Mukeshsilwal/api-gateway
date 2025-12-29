package com.ticketkatum.service.serviceimpl;

import com.ticketkatum.service.FileService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileServiceImpl implements FileService {

    private static final String UPLOAD_DIR = "uploads/citizenship/";

    @Override
    public String save(MultipartFile file) {
        try {
            String extension = getString(file);
            String uniqueName = UUID.randomUUID() + extension;

            Path filePath = Paths.get(UPLOAD_DIR + uniqueName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return filePath.toString();
        } catch (Exception e) {
            throw new RuntimeException("File upload failed: " + e.getMessage());
        }
    }

    private static String getString(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        File uploadFolder = new File(UPLOAD_DIR);
        if (!uploadFolder.exists()) {
            uploadFolder.mkdirs();
        }

        String originalName = Objects.requireNonNull(file.getOriginalFilename());
        String extension = originalName.substring(originalName.lastIndexOf("."));
        return extension;
    }
}
