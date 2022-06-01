package br.com.guesthesong.guesthesong.controller;

import br.com.guesthesong.guesthesong.model.Usuario;
import br.com.guesthesong.guesthesong.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;


@RestController
@Slf4j
@Tag(name = "User registration in the database")
@RequestMapping("/api/user/v1")
public class UserController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private ModelMapper modelMapper;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Save user in database")
    public Usuario save(Usuario usuario){
        return usuarioService.salvar(usuario);

    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "FindAll user in database")
    public List<Usuario> lista(){
        return usuarioService.lista();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Buscar usuário por ID")
    public Usuario buscarPorId(@PathVariable("id") Long id){
        return usuarioService.buscarPorId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remover usuario por ID")
    public void remover(@PathVariable("id") Long id){
        usuarioService.buscarPorId(id)
                .map(jogador -> {
                    usuarioService.remover(id);
                    return Void.TYPE;
                }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Atualizar usuário na base")
    public void atualiza(@PathVariable("id") Long id, @RequestBody Usuario usuario){
        usuarioService.buscarPorId(id)
                .map(usuarioFind -> {
                    modelMapper.map(usuario, usuarioFind);
                    return Void.TYPE;
                }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
        usuarioService.salvar(usuario);
    }
}
