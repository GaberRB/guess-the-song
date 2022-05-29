package br.com.guesthesong.guesthesong.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenApi(){
        return new OpenAPI()
                .info(new Info()
                        .title("Guess The Song DOCs")
                        .version("v1")
                        .description("Documentação da API, é utilizado a API do deezer para retornar musicas e será exibido ao jogador e o mesmo deverá advinhar qual a música antes do termino do tempo")
                        .termsOfService("http://swagger.io/terms/")
                        .license(new License().name("Apache 2.0").url("http://springdoc.org")));
    }

}
