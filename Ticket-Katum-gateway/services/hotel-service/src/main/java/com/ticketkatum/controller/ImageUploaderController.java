package com.ticketkatum.controller;

import com.ticketkatum.service.ImageUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;


@Slf4j
@RestController
@RequestMapping("/image")
@RequiredArgsConstructor
public class ImageUploaderController {

private final ImageUploadService imageUploadService;

    @PostMapping("/upload")
    public ResponseEntity<String> upload(@RequestParam("file") MultipartFile file) throws Exception {
        String url = imageUploadService.upload(file);
        return ResponseEntity.ok(url);
    }

}
