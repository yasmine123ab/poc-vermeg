package com.vermeg.pocbackend.engine;

import com.vermeg.pocbackend.model.enums.OutputFormat;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.FileWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class FileGenerator {

    private final ObjectMapper objectMapper;
    private final String outputDir;

    public FileGenerator(ObjectMapper objectMapper, @Value("${app.output.dir}") String outputDir) {
        this.objectMapper = objectMapper;
        this.outputDir = outputDir;
    }

    public String generate(List<Map<String, Object>> data, OutputFormat format, Long executionId) {
        File dir = new File(outputDir);
        if (!dir.exists() && !dir.mkdirs()) {
            throw new RuntimeException("Cannot create output directory: " + dir.getAbsolutePath());
        }

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String fileName = "execution_" + executionId + "_" + timestamp + "." + format.name().toLowerCase();
        File outputFile = new File(dir, fileName);

        try {
            if (format == OutputFormat.JSON) {
                objectMapper.writerWithDefaultPrettyPrinter().writeValue(outputFile, data);
            } else {
                writeXml(data, outputFile);
            }
            log.info("Output file generated: {}", outputFile.getAbsolutePath());
            return outputFile.getAbsolutePath();
        } catch (Exception e) {
            throw new RuntimeException("FileGenerator failed: " + e.getMessage(), e);
        }
    }

    private void writeXml(List<Map<String, Object>> data, File outputFile) throws Exception {
        StringBuilder xml = new StringBuilder("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<records>\n");
        for (Map<String, Object> row : data) {
            xml.append("  <record>\n");
            for (Map.Entry<String, Object> entry : row.entrySet()) {
                String tag   = sanitizeTag(entry.getKey());
                String value = entry.getValue() != null ? escapeXml(entry.getValue().toString()) : "";
                xml.append("    <").append(tag).append(">")
                        .append(value)
                        .append("</").append(tag).append(">\n");
            }
            xml.append("  </record>\n");
        }
        xml.append("</records>");
        try (FileWriter writer = new FileWriter(outputFile)) {
            writer.write(xml.toString());
        }
    }

    private String sanitizeTag(String key) {
        return key.replaceAll("[^a-zA-Z0-9_\\-.]", "_");
    }

    private String escapeXml(String value) {
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
