package br.com.guesthesong.guesthesong.service;

import br.com.guesthesong.guesthesong.model.Usuario;
import br.com.guesthesong.guesthesong.model.Usuario;
import br.com.guesthesong.guesthesong.repository.UsuarioRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Usuario salvar(Usuario usuario){
        log.info("Retorno do usuário: {}", usuario);
        return usuarioRepository.save(usuario);
    }

    public List<Usuario> lista(){
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarPorId(long id){
        return usuarioRepository.findById(id);
    }

    public void remover(Long id){
        usuarioRepository.deleteById(id);
    }
}
