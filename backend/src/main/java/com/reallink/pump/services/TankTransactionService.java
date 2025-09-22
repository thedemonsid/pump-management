package com.reallink.pump.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateTankTransactionRequest;
import com.reallink.pump.dto.response.TankTransactionResponse;
import com.reallink.pump.entities.DailyTankLevel;
import com.reallink.pump.entities.Tank;
import com.reallink.pump.entities.TankTransaction;
import com.reallink.pump.entities.TankTransaction.TransactionType;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.TankTransactionMapper;
import com.reallink.pump.repositories.DailyTankLevelRepository;
import com.reallink.pump.repositories.TankRepository;
import com.reallink.pump.repositories.TankTransactionRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TankTransactionService {

    private final TankTransactionRepository transactionRepository;
    private final TankRepository tankRepository;
    private final TankTransactionMapper mapper;
    private final DailyTankLevelRepository dailyTankLevelRepository;

    public List<TankTransactionResponse> getTransactionsByTankId(@NotNull UUID tankId) {
        List<TankTransaction> transactions = transactionRepository.findByTankIdOrderByTransactionDateDesc(tankId);
        return mapper.toResponseList(transactions);
    }

    public List<TankTransactionResponse> getTransactionsByTankIdAndDateRange(
            UUID tankId, LocalDate fromDate, LocalDate toDate) {
        List<TankTransaction> transactions = transactionRepository
                .findByTankIdAndTransactionDateBetweenOrderByTransactionDateAsc(
                        tankId, fromDate.atStartOfDay(), toDate.atTime(23, 59, 59));
        return transactions.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TankTransactionResponse createAdditionTransaction(@NotNull UUID tankId, @Valid CreateTankTransactionRequest request) {
        Tank tank = tankRepository.findById(tankId).orElse(null);
        if (tank == null) {
            throw new PumpBusinessException("TANK_NOT_FOUND", "Tank with ID " + tankId + " not found");
        }
        TankTransaction transaction = mapper.toEntity(request);
        transaction.setTank(tank);
        transaction.setTransactionType(TransactionType.ADDITION);
        transaction.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());
        if (transaction.getTransactionDate() == null) {
            transaction.setTransactionDate(LocalDateTime.now());
        }
        TankTransaction saved = transactionRepository.save(transaction);
        updateDailyTankLevel(saved);
        return mapper.toResponse(saved);
    }

    @Transactional
    public TankTransactionResponse createRemovalTransaction(@NotNull UUID tankId, @Valid CreateTankTransactionRequest request) {
        Tank tank = tankRepository.findById(tankId).orElse(null);
        if (tank == null) {
            throw new PumpBusinessException("TANK_NOT_FOUND", "Tank with ID " + tankId + " not found");
        }
        TankTransaction transaction = mapper.toEntity(request);
        transaction.setTank(tank);
        transaction.setTransactionType(TransactionType.REMOVAL);
        transaction.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());
        if (transaction.getTransactionDate() == null) {
            transaction.setTransactionDate(LocalDateTime.now());
        }
        TankTransaction saved = transactionRepository.save(transaction);
        updateDailyTankLevel(saved);
        return mapper.toResponse(saved);
    }

    private void updateDailyTankLevel(TankTransaction transaction) {
        LocalDate date = transaction.getTransactionDate().toLocalDate();
        BigDecimal dailyNet = transactionRepository.getDailyNetByTankIdAndDate(transaction.getTank().getId(), date);
        DailyTankLevel dailyLevel = dailyTankLevelRepository.findByTank_IdAndDate(transaction.getTank().getId(), date)
                .orElse(new DailyTankLevel());
        dailyLevel.setTank(transaction.getTank());
        dailyLevel.setDate(date);
        dailyLevel.setDailyNet(dailyNet);
        dailyTankLevelRepository.save(dailyLevel);
    }

    public BigDecimal getOpeningLevel(UUID tankId, LocalDate date) {
        Tank tank = tankRepository.findById(tankId).orElse(null);
        if (tank == null) {
            throw new PumpBusinessException("TANK_NOT_FOUND", "Tank with ID " + tankId + " not found");
        }

        // Get cumulative additions up to the specified date
        BigDecimal cumulativeAdditions = dailyTankLevelRepository.getCumulativeNetUpToDate(tankId, date);

        // Return opening level + cumulative additions
        return tank.getOpeningLevel().add(cumulativeAdditions);
    }
}
