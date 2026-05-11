package com.example.moneymanager.service;

import com.example.moneymanager.dto.GroupExpenseDTO;
import com.example.moneymanager.dto.GroupExpenseSplitDTO;
import com.example.moneymanager.entity.GroupEntity;
import com.example.moneymanager.entity.GroupExpenseEntity;
import com.example.moneymanager.entity.GroupExpenseSplitEntity;
import com.example.moneymanager.entity.ProfileEntity;
import com.example.moneymanager.entity.enums.SplitType;
import com.example.moneymanager.repository.GroupExpenseRepository;
import com.example.moneymanager.repository.GroupMemberRepository;
import com.example.moneymanager.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupExpenseService {

    private final GroupExpenseRepository groupExpenseRepository;
    private final GroupService groupService;
    private final ProfileService profileService;
    private final ProfileRepository profileRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final NotificationService notificationService;

    @Transactional
    public GroupExpenseDTO addExpense(Long groupId, GroupExpenseDTO request) {
        ProfileEntity currentProfile = profileService.getCurrentProfile();
        GroupEntity group = groupService.getGroupAndVerifyMembership(groupId, currentProfile.getId());

        ProfileEntity paidBy = currentProfile;
        if (request.getPaidById() != null && !request.getPaidById().equals(currentProfile.getId())) {
            paidBy = profileRepository.findById(request.getPaidById())
                    .orElseThrow(() -> new RuntimeException("Người thanh toán không tồn tại"));
            if (!groupMemberRepository.existsByGroupIdAndProfileId(groupId, paidBy.getId())) {
                throw new RuntimeException("Người thanh toán không nằm trong nhóm");
            }
        }

        GroupExpenseEntity expense = GroupExpenseEntity.builder()
                .group(group)
                .paidBy(paidBy)
                .amount(request.getAmount())
                .description(request.getDescription())
                .date(request.getDate())
                .splitType(request.getSplitType() != null ? request.getSplitType() : SplitType.EQUAL)
                .build();

        List<GroupExpenseSplitEntity> splits = new ArrayList<>();
        
        if (expense.getSplitType() == SplitType.EQUAL) {
            List<ProfileEntity> members = groupMemberRepository.findByGroupId(groupId).stream()
                    .map(m -> m.getProfile()).toList();
            
            if (members.isEmpty()) throw new RuntimeException("Nhóm không có thành viên");
            
            BigDecimal splitAmount = expense.getAmount().divide(BigDecimal.valueOf(members.size()), 2, RoundingMode.HALF_UP);
            
            for (ProfileEntity member : members) {
                splits.add(GroupExpenseSplitEntity.builder()
                        .groupExpense(expense)
                        .member(member)
                        .amount(splitAmount)
                        .isPaid(member.getId().equals(paidBy.getId()))
                        .build());
            }
        } else {
            // CUSTOM split
            BigDecimal totalSplit = BigDecimal.ZERO;
            for (GroupExpenseSplitDTO splitDTO : request.getSplits()) {
                ProfileEntity member = profileRepository.findById(splitDTO.getMemberId())
                        .orElseThrow(() -> new RuntimeException("Thành viên không tồn tại"));
                
                splits.add(GroupExpenseSplitEntity.builder()
                        .groupExpense(expense)
                        .member(member)
                        .amount(splitDTO.getAmount())
                        .isPaid(member.getId().equals(paidBy.getId()) || Boolean.TRUE.equals(splitDTO.getIsPaid()))
                        .build());
                        
                totalSplit = totalSplit.add(splitDTO.getAmount());
            }
            
            if (totalSplit.compareTo(expense.getAmount()) != 0) {
                throw new RuntimeException("Tổng chia sẻ không bằng tổng số tiền");
            }
        }

        expense.setSplits(splits);
        expense = groupExpenseRepository.save(expense);

        // Notify others
        notificationService.notifyGroupExpenseAdded(currentProfile, group.getName(), expense.getDescription(), expense.getAmount());

        return mapToDTO(expense);
    }

    @Transactional(readOnly = true)
    public List<GroupExpenseDTO> getGroupExpenses(Long groupId) {
        ProfileEntity currentProfile = profileService.getCurrentProfile();
        groupService.getGroupAndVerifyMembership(groupId, currentProfile.getId());

        return groupExpenseRepository.findByGroupIdOrderByDateDesc(groupId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    private GroupExpenseDTO mapToDTO(GroupExpenseEntity expense) {
        return GroupExpenseDTO.builder()
                .id(expense.getId())
                .groupId(expense.getGroup().getId())
                .paidById(expense.getPaidBy().getId())
                .paidByName(expense.getPaidBy().getFullName())
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .date(expense.getDate())
                .splitType(expense.getSplitType())
                .createdAt(expense.getCreatedAt())
                .splits(expense.getSplits().stream().map(s -> GroupExpenseSplitDTO.builder()
                        .id(s.getId())
                        .memberId(s.getMember().getId())
                        .memberName(s.getMember().getFullName())
                        .amount(s.getAmount())
                        .isPaid(s.getIsPaid())
                        .build()).toList())
                .build();
    }
}
