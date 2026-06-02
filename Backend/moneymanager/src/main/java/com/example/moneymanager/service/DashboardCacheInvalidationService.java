package com.example.moneymanager.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class DashboardCacheInvalidationService {

    @CacheEvict(value = "dashboard", allEntries = true)
    public void evictDashboard() {
        log.debug("Evicted dashboard cache entries.");
    }
}
