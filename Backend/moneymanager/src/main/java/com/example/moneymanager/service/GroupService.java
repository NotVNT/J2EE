package com.example.moneymanager.service;

import com.example.moneymanager.dto.GroupDTO;
import com.example.moneymanager.dto.GroupMemberDTO;
import com.example.moneymanager.entity.GroupEntity;
import com.example.moneymanager.entity.GroupMemberEntity;
import com.example.moneymanager.entity.ProfileEntity;
import com.example.moneymanager.entity.enums.GroupMemberRole;
import com.example.moneymanager.repository.GroupMemberRepository;
import com.example.moneymanager.repository.GroupRepository;
import com.example.moneymanager.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ProfileService profileService;
    private final ProfileRepository profileRepository;
    private final SubscriptionService subscriptionService;

    @Transactional
    public GroupDTO createGroup(GroupDTO request) {
        ProfileEntity currentProfile = profileService.getCurrentProfile();
        subscriptionService.ensureCanUseGroupBudgeting(currentProfile);

        GroupEntity group = GroupEntity.builder()
                .name(request.getName())
                .description(request.getDescription())
                .avatarIcon(request.getAvatarIcon())
                .creator(currentProfile)
                .build();
        group = groupRepository.save(group);

        GroupMemberEntity adminMember = GroupMemberEntity.builder()
                .group(group)
                .profile(currentProfile)
                .role(GroupMemberRole.ADMIN)
                .build();
        groupMemberRepository.save(adminMember);

        return mapToDTO(group, currentProfile.getId());
    }

    @Transactional(readOnly = true)
    public List<GroupDTO> getMyGroups() {
        ProfileEntity currentProfile = profileService.getCurrentProfile();
        return groupMemberRepository.findByProfileId(currentProfile.getId()).stream()
                .map(m -> mapToDTO(m.getGroup(), currentProfile.getId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public GroupDTO getGroupDetails(Long groupId) {
        ProfileEntity currentProfile = profileService.getCurrentProfile();
        GroupEntity group = getGroupAndVerifyMembership(groupId, currentProfile.getId());
        return mapToDTO(group, currentProfile.getId());
    }

    @Transactional
    public GroupDTO updateGroup(Long groupId, GroupDTO request) {
        ProfileEntity currentProfile = profileService.getCurrentProfile();
        GroupEntity group = getGroupAndVerifyMembership(groupId, currentProfile.getId());

        GroupMemberEntity membership = groupMemberRepository.findByGroupIdAndProfileId(groupId, currentProfile.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên nhóm"));

        if (membership.getRole() != GroupMemberRole.ADMIN) {
            throw new RuntimeException("Chỉ Admin mới có quyền cập nhật nhóm");
        }

        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setAvatarIcon(request.getAvatarIcon());
        group = groupRepository.save(group);

        return mapToDTO(group, currentProfile.getId());
    }

    @Transactional
    public void addMemberByEmail(Long groupId, String email) {
        ProfileEntity currentProfile = profileService.getCurrentProfile();
        GroupEntity group = getGroupAndVerifyMembership(groupId, currentProfile.getId());

        GroupMemberEntity membership = groupMemberRepository.findByGroupIdAndProfileId(groupId, currentProfile.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên nhóm"));

        if (membership.getRole() != GroupMemberRole.ADMIN) {
            throw new RuntimeException("Chỉ Admin mới có quyền thêm thành viên");
        }

        ProfileEntity newMember = profileRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email này"));

        if (groupMemberRepository.existsByGroupIdAndProfileId(groupId, newMember.getId())) {
            throw new RuntimeException("Người dùng này đã ở trong nhóm");
        }

        GroupMemberEntity newMembership = GroupMemberEntity.builder()
                .group(group)
                .profile(newMember)
                .role(GroupMemberRole.MEMBER)
                .build();
        groupMemberRepository.save(newMembership);
    }

    @Transactional(readOnly = true)
    public List<GroupMemberDTO> getGroupMembers(Long groupId) {
        ProfileEntity currentProfile = profileService.getCurrentProfile();
        getGroupAndVerifyMembership(groupId, currentProfile.getId());

        return groupMemberRepository.findByGroupId(groupId).stream()
                .map(m -> GroupMemberDTO.builder()
                        .id(m.getId())
                        .groupId(m.getGroup().getId())
                        .profileId(m.getProfile().getId())
                        .fullName(m.getProfile().getFullName())
                        .email(m.getProfile().getEmail())
                        .profileImageUrl(m.getProfile().getProfileImageUrl())
                        .role(m.getRole())
                        .joinedAt(m.getJoinedAt())
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }

    protected GroupEntity getGroupAndVerifyMembership(Long groupId, Long profileId) {
        GroupEntity group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm"));
        if (!groupMemberRepository.existsByGroupIdAndProfileId(groupId, profileId)) {
            throw new RuntimeException("Bạn không có quyền truy cập nhóm này");
        }
        return group;
    }

    private GroupDTO mapToDTO(GroupEntity group, Long currentProfileId) {
        List<GroupMemberEntity> members = groupMemberRepository.findByGroupId(group.getId());
        String myRole = members.stream()
                .filter(m -> m.getProfile().getId().equals(currentProfileId))
                .map(m -> m.getRole().name())
                .findFirst().orElse(null);

        return GroupDTO.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .avatarIcon(group.getAvatarIcon())
                .creatorId(group.getCreator().getId())
                .creatorName(group.getCreator().getFullName())
                .createdAt(group.getCreatedAt())
                .memberCount(members.size())
                .myRole(myRole)
                .build();
    }
}
