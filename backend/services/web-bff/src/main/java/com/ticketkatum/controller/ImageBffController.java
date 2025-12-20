package com.ticketkatum.controller;

import com.ticketkatum.client.ImageServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/bff/v1/images")
@RequiredArgsConstructor
public class ImageBffController {

    private final ImageServiceClient imageServiceClient;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CompletableFuture<ResponseEntity<String>> uploadImage(@RequestParam("file") MultipartFile file) {
        return imageServiceClient.uploadImage(file)
                .thenApply(ResponseEntity::ok);
    }
}
