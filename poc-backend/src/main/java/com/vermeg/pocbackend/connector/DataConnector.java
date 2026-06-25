package com.vermeg.pocbackend.connector;

import com.vermeg.pocbackend.model.ConnectorConfig;
import com.vermeg.pocbackend.model.enums.ConnectorType;

import java.util.List;
import java.util.Map;

public interface DataConnector {
    List<Map<String, Object>> read(String config, ConnectorConfig connectorConfig);
    boolean validate(String config, ConnectorConfig connectorConfig);
    ConnectorType getType();
}
