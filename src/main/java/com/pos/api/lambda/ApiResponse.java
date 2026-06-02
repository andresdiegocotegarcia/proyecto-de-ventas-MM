package com.pos.api.lambda;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

public class ApiResponse {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final Map<String, String> HEADERS = Map.of(
            "Content-Type", "application/json",
            "Access-Control-Allow-Origin", "*"
    );

    public static APIGatewayV2HTTPResponse json(int statusCode, Object body) {
        try {
            String json = MAPPER.writeValueAsString(body);
            return APIGatewayV2HTTPResponse.builder()
                    .withStatusCode(statusCode)
                    .withHeaders(HEADERS)
                    .withBody(json)
                    .build();
        } catch (Exception e) {
            return APIGatewayV2HTTPResponse.builder()
                    .withStatusCode(500)
                    .withHeaders(HEADERS)
                    .withBody("{\"message\":\"Error interno de serializacion\"}")
                    .build();
        }
    }
}
