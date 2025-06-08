package com.eventify.backend.repository;

import com.eventify.backend.entity.GlobalSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GlobalSettingRepository extends JpaRepository<GlobalSetting, Long> {
    Optional<GlobalSetting> findByKey(String key);
}
