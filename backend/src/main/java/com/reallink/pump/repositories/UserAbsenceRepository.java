package com.reallink.pump.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.UserAbsence;

@Repository
public interface UserAbsenceRepository extends JpaRepository<UserAbsence, UUID> {

    @Query("SELECT ua FROM UserAbsence ua "
            + "LEFT JOIN FETCH ua.user u "
            + "LEFT JOIN FETCH u.role "
            + "WHERE ua.pumpMaster.id = :pumpMasterId "
            + "ORDER BY ua.absenceDate DESC")
    List<UserAbsence> findByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT ua FROM UserAbsence ua "
            + "LEFT JOIN FETCH ua.user u "
            + "LEFT JOIN FETCH u.role "
            + "WHERE ua.user.id = :userId AND ua.pumpMaster.id = :pumpMasterId "
            + "ORDER BY ua.absenceDate DESC")
    List<UserAbsence> findByUserIdAndPumpMasterId(
            @Param("userId") UUID userId,
            @Param("pumpMasterId") UUID pumpMasterId
    );

    @Query("SELECT ua FROM UserAbsence ua "
            + "LEFT JOIN FETCH ua.user u "
            + "LEFT JOIN FETCH u.role "
            + "WHERE ua.absenceDate BETWEEN :startDate AND :endDate "
            + "AND ua.pumpMaster.id = :pumpMasterId "
            + "ORDER BY ua.absenceDate DESC")
    List<UserAbsence> findByDateRangeAndPumpMasterId(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("pumpMasterId") UUID pumpMasterId
    );

    @Query("SELECT ua FROM UserAbsence ua "
            + "LEFT JOIN FETCH ua.user u "
            + "LEFT JOIN FETCH u.role "
            + "WHERE ua.isApproved = :isApproved AND ua.pumpMaster.id = :pumpMasterId "
            + "ORDER BY ua.absenceDate DESC")
    List<UserAbsence> findByApprovalStatusAndPumpMasterId(
            @Param("isApproved") Boolean isApproved,
            @Param("pumpMasterId") UUID pumpMasterId
    );

    boolean existsByUserIdAndAbsenceDateAndPumpMaster_Id(
            UUID userId,
            LocalDate absenceDate,
            UUID pumpMasterId
    );
}
