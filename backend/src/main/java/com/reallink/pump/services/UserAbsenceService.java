package com.reallink.pump.services;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateUserAbsenceRequest;
import com.reallink.pump.dto.request.UpdateUserAbsenceRequest;
import com.reallink.pump.dto.response.UserAbsenceResponse;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.User;
import com.reallink.pump.entities.UserAbsence;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.UserAbsenceMapper;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.UserAbsenceRepository;
import com.reallink.pump.repositories.UserRepository;
import com.reallink.pump.security.SecurityHelper;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserAbsenceService {

    private final UserAbsenceRepository repository;
    private final UserRepository userRepository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final UserAbsenceMapper mapper;
    private final SecurityHelper securityHelper;

    public List<UserAbsenceResponse> getAllByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMasterId(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<UserAbsenceResponse> getByUserId(@NotNull UUID userId, @NotNull UUID pumpMasterId) {
        return repository.findByUserIdAndPumpMasterId(userId, pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<UserAbsenceResponse> getByDateRange(
            @NotNull LocalDate startDate,
            @NotNull LocalDate endDate,
            @NotNull UUID pumpMasterId) {
        return repository.findByDateRangeAndPumpMasterId(startDate, endDate, pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<UserAbsenceResponse> getByApprovalStatus(
            @NotNull Boolean isApproved,
            @NotNull UUID pumpMasterId) {
        return repository.findByApprovalStatusAndPumpMasterId(isApproved, pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public UserAbsenceResponse getById(@NotNull UUID id) {
        UserAbsence absence = repository.findById(id).orElse(null);
        if (absence == null) {
            throw new PumpBusinessException("ABSENCE_NOT_FOUND", "User absence record with ID " + id + " not found");
        }
        return mapper.toResponse(absence);
    }

    @Transactional
    public UserAbsenceResponse create(@Valid CreateUserAbsenceRequest request, @NotNull UUID pumpMasterId) {
        // Check if absence record already exists for this user and date
        if (repository.existsByUserIdAndAbsenceDateAndPumpMaster_Id(
                request.getUserId(), request.getAbsenceDate(), pumpMasterId)) {
            throw new PumpBusinessException("DUPLICATE_ABSENCE",
                    "Absence record already exists for this user on " + request.getAbsenceDate());
        }

        // Fetch the user
        User user = userRepository.findById(request.getUserId()).orElse(null);
        if (user == null) {
            throw new PumpBusinessException("USER_NOT_FOUND",
                    "User with ID " + request.getUserId() + " does not exist");
        }

        // Verify user belongs to the pump master
        if (!user.getPumpMaster().getId().equals(pumpMasterId)) {
            throw new PumpBusinessException("INVALID_USER",
                    "User does not belong to the specified pump master");
        }

        // Fetch the PumpInfoMaster entity
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(pumpMasterId).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Pump master with ID " + pumpMasterId + " does not exist");
        }

        UserAbsence absence = mapper.toEntity(request);
        absence.setUser(user);
        absence.setPumpMaster(pumpMaster);

        UserAbsence savedAbsence = repository.save(absence);
        return mapper.toResponse(savedAbsence);
    }

    @Transactional
    public UserAbsenceResponse update(@NotNull UUID id, @Valid UpdateUserAbsenceRequest request) {
        UserAbsence existingAbsence = repository.findById(id).orElse(null);
        if (existingAbsence == null) {
            throw new PumpBusinessException("ABSENCE_NOT_FOUND", "User absence record with ID " + id + " not found");
        }

        // If updating approval status, record who approved it
        if (request.getIsApproved() != null && request.getIsApproved() && !existingAbsence.getIsApproved()) {
            String currentUsername = securityHelper.getCurrentUsername();
            existingAbsence.setApprovedBy(currentUsername);
        }

        mapper.updateEntityFromRequest(request, existingAbsence);

        UserAbsence savedAbsence = repository.save(existingAbsence);
        return mapper.toResponse(savedAbsence);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        UserAbsence absence = repository.findById(id).orElse(null);
        if (absence == null) {
            throw new PumpBusinessException("ABSENCE_NOT_FOUND", "User absence record with ID " + id + " not found");
        }

        repository.delete(absence);
    }
}
