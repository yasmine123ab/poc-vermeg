package com.vermeg.pocbackend.connector.impl;

import com.vermeg.pocbackend.connector.DataConnector;
import com.vermeg.pocbackend.model.ConnectorConfig;
import com.vermeg.pocbackend.model.enums.ConnectorType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.File;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class FileConnector implements DataConnector {

    private final ObjectMapper objectMapper;

    @Override
    public List<Map<String, Object>> read(String config, ConnectorConfig connectorConfig) {
        try {
            Map<String, Object> configMap = objectMapper.readValue(config, new TypeReference<>() {});
            String filePath = (String) configMap.get("filePath");
            File file = new File(filePath);
            log.info("Reading file: {}", filePath);

            if (filePath.toLowerCase().endsWith(".xml")) {
                return readXml(file);
            }
            try {
                return objectMapper.readValue(file, new TypeReference<List<Map<String, Object>>>() {});
            } catch (Exception e) {
                Map<String, Object> single = objectMapper.readValue(file, new TypeReference<>() {});
                return List.of(single);
            }
        } catch (Exception e) {
            throw new RuntimeException("FileConnector read failed: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean validate(String config, ConnectorConfig connectorConfig) {
        try {
            Map<String, Object> configMap = objectMapper.readValue(config, new TypeReference<>() {});
            String filePath = (String) configMap.get("filePath");
            return filePath != null && new File(filePath).exists();
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public ConnectorType getType() {
        return ConnectorType.FILE;
    }

    private List<Map<String, Object>> readXml(File file) throws Exception {
        Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(file);
        doc.getDocumentElement().normalize();
        List<Map<String, Object>> result = new ArrayList<>();
        NodeList records = doc.getDocumentElement().getChildNodes();
        for (int i = 0; i < records.getLength(); i++) {
            Node record = records.item(i);
            if (record.getNodeType() != Node.ELEMENT_NODE) continue;
            Map<String, Object> row = new LinkedHashMap<>();
            NodeList fields = record.getChildNodes();
            for (int j = 0; j < fields.getLength(); j++) {
                Node field = fields.item(j);
                if (field.getNodeType() == Node.ELEMENT_NODE) {
                    row.put(field.getNodeName(), ((Element) field).getTextContent());
                }
            }
            result.add(row);
        }
        return result;
    }
}
