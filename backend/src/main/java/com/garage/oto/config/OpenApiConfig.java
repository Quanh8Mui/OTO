package com.garage.oto.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

  @Bean
  public OpenAPI otoGarageOpenAPI() {
    final String bearer = "bearerAuth";
    return new OpenAPI()
        .info(
            new Info()
                .title("OTO Garage API")
                .description("REST API garage ô tô — JWT Bearer. Sau khi login, nút Authorize và dán token.")
                .version("1.0.0"))
        .addSecurityItem(new SecurityRequirement().addList(bearer))
        .components(
            new Components()
                .addSecuritySchemes(
                    bearer,
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Giá trị: token trả về từ POST /api/auth/login (không gõ chữ Bearer trước nếu UI đã tự gắn).")));
  }
}
