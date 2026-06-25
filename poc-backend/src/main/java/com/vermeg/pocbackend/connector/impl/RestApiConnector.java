package com.vermeg.pocbackend.connector.impl;

import com.vermeg.pocbackend.connector.DataConnector;
import com.vermeg.pocbackend.model.ConnectorConfig;
import com.vermeg.pocbackend.model.enums.ConnectorType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class RestApiConnector implements DataConnector {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public List<Map<String, Object>> read(String config, ConnectorConfig connectorConfig) {
        try {
            Map<String, Object> configMap = objectMapper.readValue(config, new TypeReference<>() {});
            String url = (String) configMap.get("url");
            String method = (String) configMap.getOrDefault("method", "GET");
            log.info("Calling REST API [{} {}]", method, url);

            String response = restTemplate.getForObject(url, String.class);
            try {
                return objectMapper.readValue(response, new TypeReference<List<Map<String, Object>>>() {});
            } catch (Exception e) {
                Map<String, Object> single = objectMapper.readValue(response, new TypeReference<>() {});
                return List.of(single);
            }
        } catch (Exception e) {
            throw new RuntimeException("RestApiConnector read failed: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean validate(String config, ConnectorConfig connectorConfig) {
        try {
            Map<String, Object> configMap = objectMapper.readValue(config, new TypeReference<>() {});
            String url = (String) configMap.get("url");
            return url != null && !url.isBlank();
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public ConnectorType getType() {
        return ConnectorType.REST_API;
    }
}
