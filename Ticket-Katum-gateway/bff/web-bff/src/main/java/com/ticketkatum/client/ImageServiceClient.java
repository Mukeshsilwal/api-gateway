package com.ticketkatum.client;

import com.ticketkatum.config.ServiceUrlConfig;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
@RequiredArgsConstructor
public class ImageServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceUrlConfig serviceUrls;

    private static final String CIRCUIT_BREAKER_NAME = "imageService";

    private WebClient getWebClient() {
        return webClientBuilder
                .baseUrl(serviceUrls.getImageServiceUrl())
                .build();
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "uploadImageFallback")
    @Retry(name = "image-service")
    public CompletableFuture<String> uploadImage(MultipartFile file) {
        log.debug("Uploading image: {}", file.getOriginalFilename());

        try {
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", file.getResource());

            return getWebClient()
                    .post()
                    .uri("/image/upload")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(String.class)
                    .toFuture();

        } catch (Exception e) {
            log.error("Error uploading image", e);
            throw new ServiceClientException("Image upload failed", e);
        }
    }

    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "uploadImageBytesFallback")
    @Retry(name = "image-service")
    public CompletableFuture<String> uploadImageBytes(
            byte[] imageBytes, String fileName, String contentType) {

        log.debug("Uploading image bytes: {}", fileName);

        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("file", imageBytes)
                .filename(fileName)
                .contentType(MediaType.parseMediaType(contentType));

        return getWebClient()
                .post()
                .uri("/image/upload")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(String.class)
                .toFuture();
    }

    /**
     * Upload multiple images in batch
     */
    @CircuitBreaker(name = CIRCUIT_BREAKER_NAME, fallbackMethod = "uploadMultipleImagesFallback")
    @Retry(name = "image-service")
    public CompletableFuture<List<String>> uploadMultipleImages(List<MultipartFile> files) {
        log.debug("Uploading {} images", files.size());

        List<CompletableFuture<String>> uploadFutures = files.stream()
                .map(this::uploadImage)
                .toList();

        return CompletableFuture.allOf(uploadFutures.toArray(new CompletableFuture[0]))
                .thenApply(v -> uploadFutures.stream()
                        .map(CompletableFuture::join)
                        .toList());
    }

    // Fallback methods
    private CompletableFuture<String> uploadImageFallback(MultipartFile file, Throwable ex) {
        log.warn("Fallback: uploadImage for file: {}", file.getOriginalFilename());
        return CompletableFuture.completedFuture(null);
    }

    private CompletableFuture<String> uploadImageBytesFallback(
            byte[] imageBytes, String fileName, String contentType, Throwable ex) {
        log.warn("Fallback: uploadImageBytes for: {}", fileName);
        return CompletableFuture.completedFuture(null);
    }

    private CompletableFuture<List<String>> uploadMultipleImagesFallback(
            List<MultipartFile> files, Throwable ex) {
        log.warn("Fallback: uploadMultipleImages");
        return CompletableFuture.completedFuture(java.util.Collections.emptyList());
    }
}
