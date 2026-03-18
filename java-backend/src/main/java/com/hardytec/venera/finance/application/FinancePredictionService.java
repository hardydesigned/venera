package com.hardytec.venera.finance.application;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FinancePredictionService {
    private static final String DEFAULT_CATEGORY = "Standard";
    private static final Logger log = LoggerFactory.getLogger(FinancePredictionService.class);

    public record PredictionInput(LocalDate bookingDate, String payee, String purpose, BigDecimal amount) {
    }

    public record PredictionResult(String category, double confidence) {
    }

    private final ObjectMapper objectMapper;

    public FinancePredictionService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public List<PredictionResult> predictBatch(List<PredictionInput> inputs) {
        if (inputs.isEmpty()) {
            return List.of();
        }

        List<PredictionResult> pythonPredictions = tryPythonPredict(inputs);
        if (pythonPredictions != null && pythonPredictions.size() == inputs.size()) {
            return pythonPredictions;
        }

        return inputs.stream()
                .map(this::predictFallback)
                .toList();
    }

    private List<PredictionResult> tryPythonPredict(List<PredictionInput> inputs) {
        List<Path[]> candidates = List.of(
                new Path[]{Path.of("..", "finance-ml", "predict_finance_embedding_centroid.py").normalize(), Path.of("..", "finance-ml", "model-embedding.joblib").normalize()},
                new Path[]{Path.of("..", "finance-ml", "predict_finance.py").normalize(), Path.of("..", "finance-ml", "model.joblib").normalize()}
        );

        for (Path[] candidate : candidates) {
            Path scriptPath = candidate[0];
            Path modelPath = candidate[1];
            if (!Files.exists(scriptPath) || !Files.exists(modelPath)) {
                continue;
            }

            List<PredictionResult> result = tryPythonPredictWith(scriptPath, modelPath, inputs);
            if (result != null && result.size() == inputs.size()) {
                return result;
            }
        }

        log.info("Finance prediction fallback: no usable Python model found.");
        return null;
    }

    private List<PredictionResult> tryPythonPredictWith(Path scriptPath, Path modelPath, List<PredictionInput> inputs) {
        Path inputJson = null;
        Path outputJson = null;
        try {
            inputJson = Files.createTempFile("finance-predict-input-", ".json");
            outputJson = Files.createTempFile("finance-predict-output-", ".json");

            List<Map<String, Object>> payload = new ArrayList<>();
            for (PredictionInput input : inputs) {
                Map<String, Object> row = new HashMap<>();
                row.put("bookingDate", input.bookingDate().toString());
                row.put("payee", input.payee());
                row.put("purpose", input.purpose());
                row.put("amount", input.amount());
                payload.add(row);
            }
            objectMapper.writeValue(inputJson.toFile(), payload);

            ProcessBuilder processBuilder = new ProcessBuilder(
                    "python3",
                    scriptPath.toString(),
                    "--model", modelPath.toString(),
                    "--input-json", inputJson.toString(),
                    "--output-json", outputJson.toString());
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();
            int exitCode = process.waitFor();
            if (exitCode != 0 || !Files.exists(outputJson)) {
                log.warn("Finance prediction process failed: script={}, model={}, exitCode={}", scriptPath, modelPath, exitCode);
                return null;
            }

            List<Map<String, Object>> parsed = objectMapper.readValue(outputJson.toFile(), new TypeReference<>() {
            });
            List<PredictionResult> results = new ArrayList<>();
            for (Map<String, Object> row : parsed) {
                String category = asString(row.get("category"));
                if (category.isBlank()) {
                    category = asString(row.get("categoryMain"));
                }
                if (category.isBlank()) {
                    category = DEFAULT_CATEGORY;
                }
                double confidence = asDouble(row.get("confidence"));
                results.add(new PredictionResult(category, confidence));
            }
            log.info("Finance prediction succeeded with script={}, model={}, rows={}", scriptPath, modelPath, results.size());
            return results;
        } catch (Exception ex) {
            log.warn("Finance prediction invocation failed: script={}, model={}, reason={}", scriptPath, modelPath, ex.getMessage());
            return null;
        } finally {
            deleteQuietly(inputJson);
            deleteQuietly(outputJson);
        }
    }

    private PredictionResult predictFallback(PredictionInput input) {
        return new PredictionResult(DEFAULT_CATEGORY, 1.0d);
    }

    private String asString(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private double asDouble(Object value) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        if (value == null) {
            return 0d;
        }
        try {
            return Double.parseDouble(String.valueOf(value));
        } catch (NumberFormatException ex) {
            return 0d;
        }
    }

    private void deleteQuietly(Path path) {
        if (path == null) return;
        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
        }
    }
}
