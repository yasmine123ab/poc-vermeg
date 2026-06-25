package com.vermeg.pocbackend.connector;

import com.vermeg.pocbackend.exception.ValidationException;
import com.vermeg.pocbackend.model.enums.ConnectorType;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class ConnectorFactory {

    private final List<DataConnector> connectors;
    private final Map<ConnectorType, DataConnector> connectorMap = new EnumMap<>(ConnectorType.class);

    @PostConstruct
    public void init() {
        connectors.forEach(c -> connectorMap.put(c.getType(), c));
        log.info("ConnectorFactory initialized with {} connectors: {}", connectorMap.size(), connectorMap.keySet());
    }

    public DataConnector getConnector(ConnectorType type) {
        DataConnector connector = connectorMap.get(type);
        if (connector == null) {
            throw new ValidationException("No connector registered for type: " + type);
        }
        return connector;
    }
}
