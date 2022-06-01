package br.com.guesthesong.guesthesong;

import br.com.guesthesong.guesthesong.config.DeezerConfig;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import br.com.guesthesong.guesthesong.repository.UsuarioRepository;

import java.util.Arrays;

@SpringBootApplication
@EnableConfigurationProperties(DeezerConfig.class)
public class GuesthesongApplication {

	@Autowired
	private UsuarioRepository usuarioRepository;



	@Bean
	public ModelMapper modelMapper(){
		ModelMapper modelMapper = new ModelMapper();
		modelMapper.getConfiguration().setSkipNullEnabled(true);
		return modelMapper;
	}

	public static void main(String[] args) {
		SpringApplication.run(GuesthesongApplication.class, args);
	}


}
