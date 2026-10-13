package com.foodwaste.service.impl;

import com.foodwaste.dto.SystemSettingDTO;
import com.foodwaste.entity.SystemSetting;
import com.foodwaste.exception.ResourceNotFoundException;
import com.foodwaste.mapper.EntityMapper;
import com.foodwaste.repository.SystemSettingRepository;
import com.foodwaste.service.SystemSettingService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SystemSettingServiceImpl implements SystemSettingService {

    private final SystemSettingRepository settingRepository;
    private final EntityMapper mapper;

    @PostConstruct
    public void initDefaults() {
        initDefaultSetting("FOOD_TO_MEAL_RATIO", "2", "Conversion factor: 1 KG of surplus food equals X estimated meals");
        initDefaultSetting("EXPIRY_REMINDER_24H", "true", "Enable 24-hour advance food expiry reminders");
        initDefaultSetting("EXPIRY_REMINDER_2H", "true", "Enable 2-hour advance urgent food expiry reminders");
        initDefaultSetting("RESET_TOKEN_EXPIRATION_MINUTES", "60", "Validity duration for password reset tokens in minutes");
    }

    private void initDefaultSetting(String key, String defaultValue, String description) {
        if (!settingRepository.existsBySettingKey(key)) {
            SystemSetting setting = SystemSetting.builder()
                    .settingKey(key)
                    .settingValue(defaultValue)
                    .description(description)
                    .build();
            settingRepository.save(setting);
            log.info("Initialized default system setting: {} = {}", key, defaultValue);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SystemSettingDTO> getAllSettings() {
        return settingRepository.findAll().stream()
                .map(mapper::toSystemSettingDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SystemSettingDTO getSettingByKey(String key) {
        SystemSetting setting = settingRepository.findBySettingKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found with key: " + key));
        return mapper.toSystemSettingDTO(setting);
    }

    @Override
    @Transactional
    public SystemSettingDTO updateSetting(String key, String value, String description) {
        SystemSetting setting = settingRepository.findBySettingKey(key)
                .orElse(SystemSetting.builder().settingKey(key).build());

        setting.setSettingValue(value != null ? value.trim() : "");
        if (description != null) {
            setting.setDescription(description.trim());
        }

        SystemSetting saved = settingRepository.save(setting);
        log.info("Updated system setting: {} = {}", key, value);
        return mapper.toSystemSettingDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public double getFoodToMealRatio() {
        try {
            return settingRepository.findBySettingKey("FOOD_TO_MEAL_RATIO")
                    .map(s -> Double.parseDouble(s.getSettingValue()))
                    .orElse(2.0);
        } catch (Exception e) {
            return 2.0;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean is24hReminderEnabled() {
        return settingRepository.findBySettingKey("EXPIRY_REMINDER_24H")
                .map(s -> Boolean.parseBoolean(s.getSettingValue()))
                .orElse(true);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean is2hReminderEnabled() {
        return settingRepository.findBySettingKey("EXPIRY_REMINDER_2H")
                .map(s -> Boolean.parseBoolean(s.getSettingValue()))
                .orElse(true);
    }
}
