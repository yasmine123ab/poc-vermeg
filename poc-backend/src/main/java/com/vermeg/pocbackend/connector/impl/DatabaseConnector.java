package com.vermeg.pocbackend.connector.impl;

import com.vermeg.pocbackend.connector.DataConnector;
import com.vermeg.pocbackend.model.ConnectorConfig;
import com.vermeg.pocbackend.model.enums.ConnectorType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseConnector implements DataConnector {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public List<Map<String, Object>> read(String config, ConnectorConfig connectorConfig) {
        try {
            Map<String, Object> configMap = objectMapper.readValue(config, new TypeReference<>() {});
            String query = (String) configMap.get("query");
            log.info("Executing SQL query: {}", query);
            return jdbcTemplate.queryForList(query);
        } catch (Exception e) {
            throw new RuntimeException("DatabaseConnector read failed: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean validate(String config, ConnectorConfig connectorConfig) {
        try {
            Map<String, Object> configMap = objectMapper.readValue(config, new TypeReference<>() {});
            String query = (String) configMap.get("query");
            return query != null && !query.isBlank();
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public ConnectorType getType() {
        return ConnectorType.DATABASE;
    }
}
