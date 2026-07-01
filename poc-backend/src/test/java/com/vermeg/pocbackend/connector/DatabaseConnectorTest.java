package com.vermeg.pocbackend.connector;

import com.vermeg.pocbackend.connector.impl.DatabaseConnector;
import com.vermeg.pocbackend.model.enums.ConnectorType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DatabaseConnectorTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    private DatabaseConnector connector;

    @BeforeEach
    void setUp() {
        connector = new DatabaseConnector(jdbcTemplate, new ObjectMapper());
    }

    @Test
    void getType_returnsDatabase() {
        assertThat(connector.getType()).isEqualTo(ConnectorType.DATABASE);
    }

    @Test
    void read_success_returnsRows() {
        List<Map<String, Object>> rows = List.of(
                Map.of("id", 1, "name", "Alice"),
                Map.of("id", 2, "name", "Bob")
        );
        when(jdbcTemplate.queryForList("SELECT * FROM users")).thenReturn(rows);

        List<Map<String, Object>> result = connector.read("{\"query\":\"SELECT * FROM users\"}", null);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).get("name")).isEqualTo("Alice");
        verify(jdbcTemplate).queryForList("SELECT * FROM users");
    }

    @Test
    void read_invalidConfig_missingQuery_throwsRuntimeException() {
        assertThatThrownBy(() -> connector.read("{}", null))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("DatabaseConnector read failed");
    }

    @Test
    void read_emptyQuery_throwsRuntimeException() {
        assertThatThrownBy(() -> connector.read("{\"query\":\"\"}", null))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void validate_withValidQuery_returnsTrue() {
        boolean result = connector.validate("{\"query\":\"SELECT 1\"}", null);
        assertThat(result).isTrue();
    }

    @Test
    void validate_withMissingQuery_returnsFalse() {
        boolean result = connector.validate("{}", null);
        assertThat(result).isFalse();
    }

    @Test
    void validate_withInvalidJson_returnsFalse() {
        boolean result = connector.validate("not-json", null);
        assertThat(result).isFalse();
    }
}
