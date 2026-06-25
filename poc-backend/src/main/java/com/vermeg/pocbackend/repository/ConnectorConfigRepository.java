package com.vermeg.pocbackend.repository;

import com.vermeg.pocbackend.model.ConnectorConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConnectorConfigRepository extends JpaRepository<ConnectorConfig, Long> {

    Optional<ConnectorConfig> findByFluxId(Long fluxId);
}
