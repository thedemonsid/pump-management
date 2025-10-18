package com.reallink.pump.controllers;

import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.reallink.pump.entities.FileStorage;
import com.reallink.pump.services.FileStorageService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Tag(name = "File Storage Management", description = "APIs for managing file storage")
public class FileStorageController {

    private final FileStorageService fileStorageService;

    @GetMapping("/{id}")
    @Operation(summary = "Get file by ID")
    public ResponseEntity<byte[]> getFile(@PathVariable UUID id) {
        FileStorage file = fileStorageService.getFileById(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(file.getContentType()));
        headers.setContentLength(file.getFileSize());
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getOriginalFileName() + "\"");

        return new ResponseEntity<>(file.getFileData(), headers, HttpStatus.OK);
    }
}
