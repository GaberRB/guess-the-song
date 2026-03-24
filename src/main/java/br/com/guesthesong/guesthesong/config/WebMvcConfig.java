package br.com.guesthesong.guesthesong.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/home").setViewName("forward:/home.html");
        registry.addViewController("/criar").setViewName("forward:/criar.html");
        registry.addViewController("/words").setViewName("forward:/words.html");
        registry.addViewController("/sobre").setViewName("forward:/sobre.html");
        registry.addViewController("/privacidade").setViewName("forward:/privacidade.html");
    }
}
