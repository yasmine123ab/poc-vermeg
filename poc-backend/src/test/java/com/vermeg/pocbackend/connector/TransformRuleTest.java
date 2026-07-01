package com.vermeg.pocbackend.connector;

import com.vermeg.pocbackend.exception.ValidationException;
import com.vermeg.pocbackend.model.enums.ConnectorType;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class TransformRuleTest {

    @Test
    void getConnector_registeredType_returnsCorrectConnector() {
        DataConnector dbConnector = mock(DataConnector.class);
        DataConnector restConnector = mock(DataConnector.class);
        when(dbConnector.getType()).thenReturn(ConnectorType.DATABASE);
        when(restConnector.getType()).thenReturn(ConnectorType.REST_API);

        ConnectorFactory factory = new ConnectorFactory(List.of(dbConnector, restConnector));
        factory.init();

        assertThat(factory.getConnector(ConnectorType.DATABASE)).isSameAs(dbConnector);
        assertThat(factory.getConnector(ConnectorType.REST_API)).isSameAs(restConnector);
    }

    @Test
    void getConnector_unregisteredType_throwsValidationException() {
        ConnectorFactory factory = new ConnectorFactory(List.of());
        factory.init();

        assertThatThrownBy(() -> factory.getConnector(ConnectorType.MESSAGE_QUEUE))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("MESSAGE_QUEUE");
    }

    @Test
    void init_withMultipleConnectors_allRegistered() {
        DataConnector db = mock(DataConnector.class);
        DataConnector rest = mock(DataConnector.class);
        DataConnector file = mock(DataConnector.class);
        when(db.getType()).thenReturn(ConnectorType.DATABASE);
        when(rest.getType()).thenReturn(ConnectorType.REST_API);
        when(file.getType()).thenReturn(ConnectorType.FILE);

        ConnectorFactory factory = new ConnectorFactory(List.of(db, rest, file));
        factory.init();

        assertThat(factory.getConnector(ConnectorType.DATABASE)).isSameAs(db);
        assertThat(factory.getConnector(ConnectorType.REST_API)).isSameAs(rest);
        assertThat(factory.getConnector(ConnectorType.FILE)).isSameAs(file);
    }

    @Test
    void init_emptyConnectorList_allTypesMissing() {
        ConnectorFactory factory = new ConnectorFactory(List.of());
        factory.init();

        for (ConnectorType type : ConnectorType.values()) {
            assertThatThrownBy(() -> factory.getConnector(type))
                    .isInstanceOf(ValidationException.class);
        }
    }
}
