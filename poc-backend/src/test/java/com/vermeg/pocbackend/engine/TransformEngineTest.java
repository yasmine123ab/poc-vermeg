package com.vermeg.pocbackend.engine;

import com.vermeg.pocbackend.model.TransformRule;
import com.vermeg.pocbackend.model.enums.RuleType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

import java.util.*;

import static org.assertj.core.api.Assertions.*;

class TransformEngineTest {

    private TransformEngine transformEngine;

    @BeforeEach
    void setUp() {
        transformEngine = new TransformEngine(new ObjectMapper());
    }

    private List<Map<String, Object>> testData() {
        List<Map<String, Object>> data = new ArrayList<>();
        Map<String, Object> row1 = new LinkedHashMap<>();
        row1.put("nom", "Dupont"); row1.put("age", 30); row1.put("email", "dupont@test.com");
        Map<String, Object> row2 = new LinkedHashMap<>();
        row2.put("nom", "Martin"); row2.put("age", 25); row2.put("email", "martin@test.com");
        Map<String, Object> row3 = new LinkedHashMap<>();
        row3.put("nom", "Garcia"); row3.put("age", 40); row3.put("email", "garcia@test.com");
        data.add(row1); data.add(row2); data.add(row3);
        return data;
    }

    private List<Map<String, Object>> dataWithNullEmail() {
        List<Map<String, Object>> data = new ArrayList<>();
        Map<String, Object> row1 = new LinkedHashMap<>();
        row1.put("nom", "Dupont"); row1.put("email", "dupont@test.com");
        Map<String, Object> row2 = new LinkedHashMap<>();
        row2.put("nom", "Martin"); row2.put("email", null);
        Map<String, Object> row3 = new LinkedHashMap<>();
        row3.put("nom", "Garcia"); row3.put("email", "garcia@test.com");
        data.add(row1); data.add(row2); data.add(row3);
        return data;
    }

    private TransformRule rule(int order, RuleType type, String source, String target) {
        return TransformRule.builder()
                .orderIndex(order).ruleType(type)
                .sourceField(source).targetField(target)
                .build();
    }

    @Test
    void transform_emptyRules_returnsUnchangedData() {
        List<Map<String, Object>> data = testData();
        List<Map<String, Object>> result = transformEngine.transform(data, Collections.emptyList());
        assertThat(result).isEqualTo(data);
    }

    @Test
    void transform_emptyData_returnsEmpty() {
        List<Map<String, Object>> result = transformEngine.transform(
                Collections.emptyList(),
                List.of(rule(1, RuleType.RENAME, "nom", "lastName")));
        assertThat(result).isEmpty();
    }

    @Test
    void transform_rename_replacesSourceFieldWithTarget() {
        List<Map<String, Object>> result = transformEngine.transform(
                testData(),
                List.of(rule(1, RuleType.RENAME, "nom", "lastName")));

        assertThat(result).hasSize(3);
        assertThat(result).allSatisfy(row -> {
            assertThat(row).containsKey("lastName");
            assertThat(row).doesNotContainKey("nom");
        });
        assertThat(result.get(0).get("lastName")).isEqualTo("Dupont");
    }

    @Test
    void transform_filter_removesRowsWithNullField() {
        List<Map<String, Object>> result = transformEngine.transform(
                dataWithNullEmail(),
                List.of(rule(1, RuleType.FILTER, "email", "email")));

        assertThat(result).hasSize(2);
        assertThat(result).allSatisfy(row -> assertThat(row.get("email")).isNotNull());
    }

    @Test
    void transform_cast_convertsValueToString() {
        List<Map<String, Object>> result = transformEngine.transform(
                testData(),
                List.of(rule(1, RuleType.CAST, "age", "age")));

        assertThat(result).allSatisfy(row ->
                assertThat(row.get("age")).isInstanceOf(String.class));
        assertThat(result.get(0).get("age")).isEqualTo("30");
    }

    @Test
    void transform_derive_copiesValueToNewField() {
        List<Map<String, Object>> result = transformEngine.transform(
                testData(),
                List.of(rule(1, RuleType.DERIVE, "nom", "nomCopie")));

        assertThat(result).allSatisfy(row -> {
            assertThat(row).containsKey("nom");
            assertThat(row).containsKey("nomCopie");
            assertThat(row.get("nom")).isEqualTo(row.get("nomCopie"));
        });
    }

    @Test
    void transform_concat_concatenatesTwoFields() {
        TransformRule concatRule = TransformRule.builder()
                .orderIndex(1).ruleType(RuleType.CONCAT)
                .sourceField("nom").targetField("email")
                .params("{\"resultField\":\"fullInfo\"}")
                .build();

        List<Map<String, Object>> result = transformEngine.transform(testData(), List.of(concatRule));

        assertThat(result).allSatisfy(row -> assertThat(row).containsKey("fullInfo"));
        assertThat(result.get(0).get("fullInfo")).isEqualTo("Dupontdupont@test.com");
    }

    @Test
    void transform_multipleRules_appliedInOrder() {
        List<TransformRule> rules = List.of(
                rule(1, RuleType.FILTER, "email", "email"),
                rule(2, RuleType.RENAME, "nom", "lastName")
        );

        List<Map<String, Object>> result = transformEngine.transform(dataWithNullEmail(), rules);

        assertThat(result).hasSize(2);
        assertThat(result).allSatisfy(row -> assertThat(row).containsKey("lastName"));
        assertThat(result).allSatisfy(row -> assertThat(row).doesNotContainKey("nom"));
    }
}
