package com.foodwaste.service;

import com.foodwaste.dto.SystemSettingDTO;

import java.util.List;

public interface SystemSettingService {
    List<SystemSettingDTO> getAllSettings();
    SystemSettingDTO getSettingByKey(String key);
    SystemSettingDTO updateSetting(String key, String value, String description);
    double getFoodToMealRatio();
    boolean is24hReminderEnabled();
    boolean is2hReminderEnabled();
}
