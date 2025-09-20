package com.reallink.pump.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.reallink.pump.entities.BankAccount;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, UUID> {

    Optional<BankAccount> findByAccountNumberAndPumpMaster_Id(String accountNumber, UUID pumpMasterId);

    List<BankAccount> findByPumpMaster_Id(UUID pumpMasterId);

    List<BankAccount> findByBankAndPumpMaster_Id(String bank, UUID pumpMasterId);

    List<BankAccount> findByIfscCodeAndPumpMaster_Id(String ifscCode, UUID pumpMasterId);

    boolean existsByAccountNumberAndPumpMaster_Id(String accountNumber, UUID pumpMasterId);

    boolean existsByAccountNumberAndPumpMaster_IdAndIdNot(String accountNumber, UUID pumpMasterId, UUID id);

    List<BankAccount> findByAccountHolderNameContainingIgnoreCase(String accountHolderName);

    @Query("SELECT ba FROM BankAccount ba WHERE "
            + "(:accountHolderName IS NULL OR LOWER(ba.accountHolderName) LIKE LOWER(CONCAT('%', :accountHolderName, '%'))) AND "
            + "(:accountNumber IS NULL OR ba.accountNumber = :accountNumber) AND "
            + "(:ifscCode IS NULL OR ba.ifscCode = :ifscCode) AND "
            + "(:bank IS NULL OR LOWER(ba.bank) LIKE LOWER(CONCAT('%', :bank, '%'))) AND "
            + "(:branch IS NULL OR LOWER(ba.branch) LIKE LOWER(CONCAT('%', :branch, '%'))) AND "
            + "(:pumpMasterId IS NULL OR ba.pumpMaster.id = :pumpMasterId)")
    List<BankAccount> findBySearchCriteria(@Param("accountHolderName") String accountHolderName,
            @Param("accountNumber") String accountNumber,
            @Param("ifscCode") String ifscCode,
            @Param("bank") String bank,
            @Param("branch") String branch,
            @Param("pumpMasterId") UUID pumpMasterId);

    @Query("SELECT COUNT(ba) FROM BankAccount ba WHERE ba.pumpMaster.id = :pumpMasterId")
    long countByPumpMasterId(@Param("pumpMasterId") UUID pumpMasterId);
}
