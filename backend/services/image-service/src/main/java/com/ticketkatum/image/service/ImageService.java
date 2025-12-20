package com.ticketkatum.image.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class ImageService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) {
        try {
            log.info("Uploading file: {}", file.getOriginalFilename());
            Map params = ObjectUtils.asMap(
                "folder", "ticket_katum",
                "resource_type", "auto",
                "transformation", new com.cloudinary.Transformation().quality("auto").fetchFormat("auto")
            );
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), params);
            String url = (String) uploadResult.get("secure_url");
            log.info("Successfully uploaded file. URL: {}", url);
            return url;
        } catch (IOException e) {
            log.error("Failed to upload file", e);
            throw new RuntimeException("Failed to upload image", e);
        }
    }
}
