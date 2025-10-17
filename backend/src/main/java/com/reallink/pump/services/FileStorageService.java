package com.reallink.pump.services;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.multipart.MultipartFile;

import com.reallink.pump.entities.FileStorage;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.repositories.FileStorageRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;

import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class FileStorageService {

    private final FileStorageRepository repository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;

    // Maximum file size: 10MB
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    /**
     * Store a file in the database
     *
     * @param file - MultipartFile to store
     * @param pumpMasterId - Pump master ID
     * @param category - Optional category for the file
     * @param description - Optional description
     * @return FileStorage entity
     */
    @Transactional
    public FileStorage storeFile(@NotNull MultipartFile file, @NotNull UUID pumpMasterId, String category, String description) {
        try {
            // Validate file
            validateFile(file);

            // Get pump master
            PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(pumpMasterId)
                    .orElseThrow(() -> new PumpBusinessException("PUMP_NOT_FOUND", "Pump master not found with id: " + pumpMasterId));

            // Generate unique file name
            String originalFileName = file.getOriginalFilename();
            String fileName = generateUniqueFileName(originalFileName);

            // Create FileStorage entity
            FileStorage fileStorage = new FileStorage();
            fileStorage.setPumpMaster(pumpMaster);
            fileStorage.setFileName(fileName);
            fileStorage.setOriginalFileName(originalFileName);
            fileStorage.setContentType(file.getContentType());
            fileStorage.setFileSize(file.getSize());
            fileStorage.setFileData(file.getBytes());
            fileStorage.setFileCategory(category);
            fileStorage.setDescription(description);
            fileStorage.setIsActive(true);

            return repository.save(fileStorage);
        } catch (IOException e) {
            log.error("Error storing file: {}", e.getMessage());
            throw new PumpBusinessException("FILE_STORAGE_ERROR", "Error storing file: " + e.getMessage());
        }
    }

    /**
     * Get file by ID
     *
     * @param id - File ID
     * @return FileStorage entity
     */
    public FileStorage getFileById(@NotNull UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new PumpBusinessException("FILE_NOT_FOUND", "File not found with id: " + id));
    }

    /**
     * Get file metadata only (without binary data)
     *
     * @param id - File ID
     * @return Object array with metadata
     */
    public Object[] getFileMetadata(@NotNull UUID id) {
        return repository.findMetadataById(id)
                .orElseThrow(() -> new PumpBusinessException("FILE_NOT_FOUND", "File not found with id: " + id));
    }

    /**
     * Get all files paginated
     *
     * @param pageable - Pagination info
     * @return Page of FileStorage
     */
    public Page<FileStorage> getAllFiles(Pageable pageable) {
        return repository.findAll(pageable);
    }

    /**
     * Get files by category
     *
     * @param category - File category
     * @return List of FileStorage
     */
    public List<FileStorage> getFilesByCategory(String category) {
        return repository.findByFileCategory(category);
    }

    /**
     * Get files by pump master and category
     *
     * @param pumpMasterId - Pump master ID
     * @param category - File category
     * @return List of FileStorage
     */
    public List<FileStorage> getFilesByPumpAndCategory(@NotNull UUID pumpMasterId, String category) {
        return repository.findByPumpMaster_IdAndFileCategory(pumpMasterId, category);
    }

    /**
     * Get active files by pump master
     *
     * @param pumpMasterId - Pump master ID
     * @return List of active FileStorage
     */
    public List<FileStorage> getActiveFilesByPump(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMaster_IdAndIsActiveTrue(pumpMasterId);
    }

    /**
     * Get active files by category
     *
     * @param category - File category
     * @return List of active FileStorage
     */
    public List<FileStorage> getActiveFilesByCategory(String category) {
        return repository.findActiveByCategoryOrderByCreatedAtDesc(category);
    }

    /**
     * Get active files by pump master and category
     *
     * @param pumpMasterId - Pump master ID
     * @param category - File category
     * @return List of active FileStorage
     */
    public List<FileStorage> getActiveFilesByPumpAndCategory(@NotNull UUID pumpMasterId, String category) {
        return repository.findActiveByCategoryAndPumpOrderByCreatedAtDesc(pumpMasterId, category);
    }

    /**
     * Delete file (soft delete by setting isActive to false)
     *
     * @param id - File ID
     */
    @Transactional
    public void deleteFile(@NotNull UUID id) {
        FileStorage fileStorage = getFileById(id);
        fileStorage.setIsActive(false);
        repository.save(fileStorage);
    }

    /**
     * Permanently delete file
     *
     * @param id - File ID
     */
    @Transactional
    public void permanentlyDeleteFile(@NotNull UUID id) {
        if (!repository.existsById(id)) {
            throw new PumpBusinessException("FILE_NOT_FOUND", "File not found with id: " + id);
        }
        repository.deleteById(id);
    }

    /**
     * Validate file
     *
     * @param file - MultipartFile to validate
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new PumpBusinessException("INVALID_FILE", "File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new PumpBusinessException("FILE_SIZE_EXCEEDED", "File size exceeds maximum limit of " + (MAX_FILE_SIZE / 1024 / 1024) + "MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new PumpBusinessException("INVALID_FILE_TYPE", "Invalid file type. Only images are allowed: " + ALLOWED_IMAGE_TYPES);
        }
    }

    /**
     * Generate unique file name
     *
     * @param originalFileName - Original file name
     * @return Unique file name
     */
    private String generateUniqueFileName(String originalFileName) {
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        return UUID.randomUUID().toString() + extension;
    }
}
