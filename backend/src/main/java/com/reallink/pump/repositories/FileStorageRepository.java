package com.reallink.pump.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.FileStorage;

@Repository
public interface FileStorageRepository extends JpaRepository<FileStorage, UUID> {

    Optional<FileStorage> findByFileName(String fileName);

    List<FileStorage> findByFileCategory(String fileCategory);

    List<FileStorage> findByIsActiveTrue();

    List<FileStorage> findByPumpMaster_IdAndIsActiveTrue(UUID pumpMasterId);

    List<FileStorage> findByPumpMaster_IdAndFileCategory(UUID pumpMasterId, String fileCategory);

    List<FileStorage> findByPumpMaster_IdAndFileCategoryAndIsActiveTrue(UUID pumpMasterId, String fileCategory);

    @Query("SELECT f FROM FileStorage f WHERE f.pumpMaster.id = :pumpMasterId AND f.fileCategory = :category AND f.isActive = true ORDER BY f.createdAt DESC")
    List<FileStorage> findActiveByCategoryAndPumpOrderByCreatedAtDesc(@Param("pumpMasterId") UUID pumpMasterId, @Param("category") String category);

    @Query("SELECT f FROM FileStorage f WHERE f.fileCategory = :category AND f.isActive = true")
    List<FileStorage> findActiveByCategoryOrderByCreatedAtDesc(@Param("category") String category);

    @Query("SELECT f.id, f.fileName, f.originalFileName, f.contentType, f.fileSize, f.fileCategory, f.description, f.createdAt FROM FileStorage f WHERE f.id = :id")
    Optional<Object[]> findMetadataById(@Param("id") UUID id);
}
