package br.com.guesthesong.guesthesong.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class AnyConfig {
    @Bean
    public void Any (){
            log.info("Iniciando config");
        }


}

