package com.ticketkatum.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileService {
    String save(MultipartFile file);

}
