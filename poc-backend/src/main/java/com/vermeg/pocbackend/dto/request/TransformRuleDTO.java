package com.vermeg.pocbackend.dto.request;

import com.vermeg.pocbackend.model.enums.RuleType;
import lombok.Data;

@Data
public class TransformRuleDTO {

    private Integer orderIndex;
    private RuleType ruleType;
    private String sourceField;
    private String targetField;
    private String params;
}
