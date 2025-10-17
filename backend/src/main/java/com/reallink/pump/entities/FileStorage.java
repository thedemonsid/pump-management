package com.reallink.pump.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pump_file_storage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FileStorage extends BaseEntity {

    @NotNull(message = "Pump master is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pump_master_id", nullable = false, foreignKey = @ForeignKey(name = "fk_file_storage_pump_master"))
    private PumpInfoMaster pumpMaster;

    @NotBlank(message = "File name is required")
    @Size(max = 255, message = "File name cannot exceed 255 characters")
    @Column(name = "file_name", nullable = false)
    private String fileName;

    @NotBlank(message = "Original file name is required")
    @Size(max = 255, message = "Original file name cannot exceed 255 characters")
    @Column(name = "original_file_name", nullable = false)
    private String originalFileName;

    @NotBlank(message = "Content type is required")
    @Size(max = 100, message = "Content type cannot exceed 100 characters")
    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @NotNull(message = "File size is required")
    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Lob
    @Column(name = "file_data", nullable = false, columnDefinition = "LONGBLOB")
    private byte[] fileData;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    @Column(name = "description", length = 500)
    private String description;

    @Size(max = 50, message = "File category cannot exceed 50 characters")
    @Column(name = "file_category", length = 50)
    private String fileCategory;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
