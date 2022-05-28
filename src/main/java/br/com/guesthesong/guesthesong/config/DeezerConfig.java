package br.com.guesthesong.guesthesong.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "deezer")
public class DeezerConfig {

    private String url;
    private String headerHost;
    private String headerKey;
    private String host;
    private String key;

}
