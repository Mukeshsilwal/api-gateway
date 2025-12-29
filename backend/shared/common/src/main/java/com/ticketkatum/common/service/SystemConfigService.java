package com.ticketkatum.common.service;

import com.ticketkatum.common.entity.SystemConfig;
import com.ticketkatum.common.repository.SystemConfigRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
@RequiredArgsConstructor
@org.springframework.boot.autoconfigure.condition.ConditionalOnClass(name = "javax.sql.DataSource")
public class SystemConfigService {

    private final SystemConfigRepository systemConfigRepository;
    private final Map<String, String> configCache = new ConcurrentHashMap<>();

    @PostConstruct
    public void loadConfigurations() {
        log.info("🔄 Loading System Configurations...");
        try {
            List<SystemConfig> configs = systemConfigRepository.findByIsActiveTrue();
            configCache.clear();
            for (SystemConfig config : configs) {
                configCache.put(config.getConfigKey(), config.getConfigValue());
            }
            log.info("✅ Loaded {} System Configurations", configs.size());
        } catch (Exception e) {
            log.error("❌ Failed to load System Configurations", e);
        }
    }

    public String getString(String key) {
        return configCache.get(key);
    }

    public String getString(String key, String defaultValue) {
        return configCache.getOrDefault(key, defaultValue);
    }

    public Integer getInt(String key) {
        String value = configCache.get(key);
        return value != null ? Integer.parseInt(value) : null;
    }

    public Integer getInt(String key, Integer defaultValue) {
        String value = configCache.get(key);
        return value != null ? Integer.parseInt(value) : defaultValue;
    }

    public Boolean getBoolean(String key) {
        String value = configCache.get(key);
        return value != null ? Boolean.parseBoolean(value) : null;
    }

    public Boolean getBoolean(String key, Boolean defaultValue) {
        String value = configCache.get(key);
        return value != null ? Boolean.parseBoolean(value) : defaultValue;
    }

    public Long getLong(String key) {
        String value = configCache.get(key);
        return value != null ? Long.parseLong(value) : null;
    }

    public Long getLong(String key, Long defaultValue) {
        String value = configCache.get(key);
        return value != null ? Long.parseLong(value) : defaultValue;
    }

    public void refresh() {
        loadConfigurations();
    }
}
