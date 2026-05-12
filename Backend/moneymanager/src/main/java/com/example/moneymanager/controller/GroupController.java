package com.example.moneymanager.controller;

import com.example.moneymanager.dto.GroupDTO;
import com.example.moneymanager.dto.GroupMemberDTO;
import com.example.moneymanager.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    public ResponseEntity<GroupDTO> createGroup(@RequestBody GroupDTO request) {
        return ResponseEntity.ok(groupService.createGroup(request));
    }

    @GetMapping
    public ResponseEntity<List<GroupDTO>> getMyGroups() {
        return ResponseEntity.ok(groupService.getMyGroups());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupDTO> getGroupDetails(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroupDetails(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroupDTO> updateGroup(@PathVariable Long id, @RequestBody GroupDTO request) {
        return ResponseEntity.ok(groupService.updateGroup(id, request));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<GroupMemberDTO>> getGroupMembers(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroupMembers(id));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<?> addMember(@PathVariable Long id, @RequestBody Map<String, String> request) {
        groupService.addMemberByEmail(id, request.get("email"));
        return ResponseEntity.ok(Map.of("message", "Đã thêm thành viên thành công"));
    }
}
