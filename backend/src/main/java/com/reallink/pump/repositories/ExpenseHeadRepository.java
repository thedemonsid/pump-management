package com.reallink.pump.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.ExpenseHead;

@Repository
public interface ExpenseHeadRepository extends JpaRepository<ExpenseHead, UUID> {

    Optional<ExpenseHead> findByHeadNameAndPumpMaster_Id(String headName, UUID pumpMasterId);

    List<ExpenseHead> findByPumpMaster_Id(UUID pumpMasterId);

    List<ExpenseHead> findByPumpMaster_IdAndIsActive(UUID pumpMasterId, Boolean isActive);

    boolean existsByHeadNameAndPumpMaster_Id(String headName, UUID pumpMasterId);

    boolean existsByHeadNameAndPumpMaster_IdAndIdNot(String headName, UUID pumpMasterId, UUID id);

    List<ExpenseHead> findByHeadNameContainingIgnoreCaseAndPumpMaster_Id(String headName, UUID pumpMasterId);

    @Query("SELECT eh FROM ExpenseHead eh WHERE "
            + "(:headName IS NULL OR LOWER(eh.headName) LIKE LOWER(CONCAT('%', :headName, '%'))) AND "
            + "(:isActive IS NULL OR eh.isActive = :isActive) AND "
            + "(:pumpMasterId IS NULL OR eh.pumpMaster.id = :pumpMasterId)")
    List<ExpenseHead> findBySearchCriteria(@Param("headName") String headName,
            @Param("isActive") Boolean isActive,
            @Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT COUNT(eh) FROM ExpenseHead eh WHERE eh.pumpMaster.id = :pumpMasterId")
    long countByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT COUNT(eh) FROM ExpenseHead eh WHERE eh.pumpMaster.id = :pumpMasterId AND eh.isActive = true")
    long countActiveByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);
}
