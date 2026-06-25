package com.vermeg.pocbackend.dto.request;

import com.vermeg.pocbackend.model.enums.ConnectorType;
import lombok.Data;

@Data
public class ConnectorConfigDTO {

    private ConnectorType type;
    private String host;
    private Integer port;
    private String credential;
    private String extra;
}
