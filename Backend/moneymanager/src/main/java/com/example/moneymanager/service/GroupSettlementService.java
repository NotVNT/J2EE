package com.example.moneymanager.service;

import com.example.moneymanager.dto.GroupSettlementDTO;
import com.example.moneymanager.dto.MemberBalanceDTO;
import com.example.moneymanager.entity.*;
import com.example.moneymanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class GroupSettlementService {

    private final GroupSettlementRepository groupSettlementRepository;
    private final GroupExpenseRepository groupExpenseRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupService groupService;
    private final ProfileService profileService;
    private final ProfileRepository profileRepository;
    private final NotificationService notificationService;
    private final GroupExpenseSplitRepository splitRepository;

    @Transactional(readOnly = true)
    public List<MemberBalanceDTO> getGroupBalances(Long groupId) {
        ProfileEntity currentProfile = profileService.getCurrentProfile();
        groupService.getGroupAndVerifyMembership(groupId, currentProfile.getId());

        List<GroupMemberEntity> members = groupMemberRepository.findByGroupId(groupId);
        List<GroupExpenseEntity> expenses = groupExpenseRepository.findByGroupIdOrderByDateDesc(groupId);
        List<GroupSettlementEntity> settlements = groupSettlementRepository.findByGroupIdOrderBySettledAtDesc(groupId);

        Map<Long, BigDecimal> paidTotal = new HashMap<>();
        Map<Long, BigDecimal> owedTotal = new HashMap<>();

        for (GroupMemberEntity m : members) {
            paidTotal.put(m.getProfile().getId(), BigDecimal.ZERO);
            owedTotal.put(m.getProfile().getId(), BigDecimal.ZERO);
        }

        // Expenses
        for (GroupExpenseEntity exp : expenses) {
            Long payerId = exp.getPaidBy().getId();
            paidTotal.merge(payerId, exp.getAmount(), BigDecimal::add);

            for (GroupExpenseSplitEntity split : exp.getSplits()) {
                Long memberId = split.getMember().getId();
                owedTotal.merge(memberId, split.getAmount(), BigDecimal::add);
            }
        }

        // Settlements
        for (GroupSettlementEntity st : settlements) {
            Long payerId = st.getPayer().getId();
            Long payeeId = st.getPayee().getId();

            paidTotal.merge(payerId, st.getAmount(), BigDecimal::add);
            owedTotal.merge(payeeId, st.getAmount(), BigDecimal::add); // receiving settlement is like adding to your share
        }

        List<MemberBalanceDTO> balances = new ArrayList<>();
        for (GroupMemberEntity m : members) {
            Long id = m.getProfile().getId();
            BigDecimal paid = paidTotal.getOrDefault(id, BigDecimal.ZERO);
            BigDecimal owed = owedTotal.getOrDefault(id, BigDecimal.ZERO);
            BigDecimal net = paid.subtract(owed);

            balances.add(MemberBalanceDTO.builder()
                    .memberId(id)
                    .memberName(m.getProfile().getFullName())
                    .avatarUrl(m.getProfile().getProfileImageUrl())
                    .netBalance(net)
                    .totalPaid(paid)
                    .totalOwed(owed)
                    .build());
        }

        balances.sort((a, b) -> b.getNetBalance().compareTo(a.getNetBalance())); // Creditors first

        return balances;
    }

    @Transactional
    public GroupSettlementDTO settleDebt(Long groupId, GroupSettlementDTO request) {
        ProfileEntity currentProfile = profileService.getCurrentProfile();
        GroupEntity group = groupService.getGroupAndVerifyMembership(groupId, currentProfile.getId());

        ProfileEntity payer = profileRepository.findById(request.getPayerId())
                .orElseThrow(() -> new RuntimeException("Người trả không tồn tại"));
        ProfileEntity payee = profileRepository.findById(request.getPayeeId())
                .orElseThrow(() -> new RuntimeException("Người nhận không tồn tại"));

        if (!groupMemberRepository.existsByGroupIdAndProfileId(groupId, payer.getId()) ||
            !groupMemberRepository.existsByGroupIdAndProfileId(groupId, payee.getId())) {
            throw new RuntimeException("Người trả hoặc nhận không nằm trong nhóm");
        }

        GroupSettlementEntity settlement = GroupSettlementEntity.builder()
                .group(group)
                .payer(payer)
                .payee(payee)
                .amount(request.getAmount())
                .note(request.getNote())
                .build();

        settlement = groupSettlementRepository.save(settlement);

        // Notify
        notificationService.notifyGroupSettlement(currentProfile, group.getName(), payer.getFullName(), settlement.getAmount());

        return GroupSettlementDTO.builder()
                .id(settlement.getId())
                .groupId(groupId)
                .payerId(payer.getId())
                .payerName(payer.getFullName())
                .payeeId(payee.getId())
                .payeeName(payee.getFullName())
                .amount(settlement.getAmount())
                .note(settlement.getNote())
                .settledAt(settlement.getSettledAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<GroupSettlementDTO> getSettlements(Long groupId) {
        ProfileEntity currentProfile = profileService.getCurrentProfile();
        groupService.getGroupAndVerifyMembership(groupId, currentProfile.getId());

        return groupSettlementRepository.findByGroupIdOrderBySettledAtDesc(groupId).stream()
                .map(s -> GroupSettlementDTO.builder()
                        .id(s.getId())
                        .groupId(groupId)
                        .payerId(s.getPayer().getId())
                        .payerName(s.getPayer().getFullName())
                        .payeeId(s.getPayee().getId())
                        .payeeName(s.getPayee().getFullName())
                        .amount(s.getAmount())
                        .note(s.getNote())
                        .settledAt(s.getSettledAt())
                        .build())
                .toList();
    }
}
