package com.vermeg.pocbackend.engine;

import com.vermeg.pocbackend.model.TransformRule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class TransformEngine {

    private final ObjectMapper objectMapper;

    public List<Map<String, Object>> transform(List<Map<String, Object>> data, List<TransformRule> rules) {
        if (rules == null || rules.isEmpty()) return data;

        List<Map<String, Object>> result = data.stream()
                .map(row -> new LinkedHashMap<>(row))
                .collect(Collectors.toList());

        List<TransformRule> sorted = rules.stream()
                .sorted(Comparator.comparingInt(r -> r.getOrderIndex() != null ? r.getOrderIndex() : 0))
                .toList();

        for (TransformRule rule : sorted) {
            log.debug("Applying rule {} on field '{}'", rule.getRuleType(), rule.getSourceField());
            result = applyRule(result, rule);
        }
        return result;
    }

    private List<Map<String, Object>> applyRule(List<Map<String, Object>> data, TransformRule rule) {
        return switch (rule.getRuleType()) {
            case RENAME -> applyRename(data, rule);
            case FILTER -> applyFilter(data, rule);
            case CAST   -> applyCast(data, rule);
            case CONCAT -> applyConcat(data, rule);
            case DERIVE -> applyDerive(data, rule);
        };
    }

    private List<Map<String, Object>> applyRename(List<Map<String, Object>> data, TransformRule rule) {
        return data.stream().map(row -> {
            Map<String, Object> r = new LinkedHashMap<>(row);
            if (r.containsKey(rule.getSourceField())) {
                r.put(rule.getTargetField(), r.remove(rule.getSourceField()));
            }
            return r;
        }).toList();
    }

    private List<Map<String, Object>> applyFilter(List<Map<String, Object>> data, TransformRule rule) {
        return data.stream()
                .filter(row -> row.get(rule.getSourceField()) != null)
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> applyCast(List<Map<String, Object>> data, TransformRule rule) {
        return data.stream().map(row -> {
            Map<String, Object> r = new LinkedHashMap<>(row);
            if (r.containsKey(rule.getSourceField())) {
                Object val = r.get(rule.getSourceField());
                r.put(rule.getSourceField(), val != null ? String.valueOf(val) : null);
            }
            return r;
        }).toList();
    }

    private List<Map<String, Object>> applyConcat(List<Map<String, Object>> data, TransformRule rule) {
        String resultField = parseParam(rule.getParams(), "resultField", "result");
        return data.stream().map(row -> {
            Map<String, Object> r = new LinkedHashMap<>(row);
            String left  = String.valueOf(r.getOrDefault(rule.getSourceField(), ""));
            String right = String.valueOf(r.getOrDefault(rule.getTargetField(), ""));
            r.put(resultField, left + right);
            return r;
        }).toList();
    }

    private List<Map<String, Object>> applyDerive(List<Map<String, Object>> data, TransformRule rule) {
        return data.stream().map(row -> {
            Map<String, Object> r = new LinkedHashMap<>(row);
            r.put(rule.getTargetField(), r.get(rule.getSourceField()));
            return r;
        }).toList();
    }

    private String parseParam(String params, String key, String defaultValue) {
        try {
            if (params != null && !params.isBlank()) {
                Map<String, String> map = objectMapper.readValue(params, new TypeReference<>() {});
                return map.getOrDefault(key, defaultValue);
            }
        } catch (Exception e) {
            log.warn("Could not parse rule params '{}': {}", params, e.getMessage());
        }
        return defaultValue;
    }
}
