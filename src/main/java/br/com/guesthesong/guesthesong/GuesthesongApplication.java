package br.com.guesthesong.guesthesong;

import br.com.guesthesong.guesthesong.config.DeezerConfig;
import br.com.guesthesong.guesthesong.model.Usuario;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import br.com.guesthesong.guesthesong.repository.UsuarioRepository;

import java.util.Arrays;

@SpringBootApplication
@EnableConfigurationProperties(DeezerConfig.class)
public class GuesthesongApplication implements CommandLineRunner {

	@Autowired
	private UsuarioRepository usuarioRepository;

	@Override
	public void run(String... args) throws Exception {

		Usuario usuario1  = new Usuario();
		usuario1.setId(1L);
		usuario1.setName("Shiguren");
		usuario1.setEmail("shiguren@omelhor.com");
		usuario1.setPassword("1234");

		Usuario usuario2  = new Usuario();
		usuario2.setId(2L);
		usuario2.setName("Rios");
		usuario2.setEmail("rios@podre.com");
		usuario2.setPassword("12345");

		Usuario usuario3  = new Usuario();
		usuario3.setId(3L);
		usuario3.setName("Jao");
		usuario3.setEmail("jao@podre.com");
		usuario3.setPassword("123456");

		Usuario usuario4  = new Usuario();
		usuario4.setId(4L);
		usuario4.setName("Pedroza");
		usuario4.setEmail("pedroza@podre.com");
		usuario4.setPassword("1234567");

		usuarioRepository.saveAll(Arrays.asList(usuario1, usuario2, usuario3, usuario4));
	}

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
