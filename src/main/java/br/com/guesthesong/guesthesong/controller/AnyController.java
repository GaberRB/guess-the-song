package br.com.guesthesong.guesthesong.controller;

import br.com.guesthesong.guesthesong.model.Any;
import br.com.guesthesong.guesthesong.service.AnyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Tag(name = "Qualquer classes com Any é pra vcs copiar e usar como referencia")
@RestController
@RequestMapping("/api/any/v1")
public class AnyController {

    @Autowired
    private AnyService anyService;

    @Autowired
    private ModelMapper modelMapper;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Salvar no banco de dados")
    public Any salvar(Any any){
        return anyService.salvar(any);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Consulta de todos no banco de dados")
    public List<Any> lista(){
        return anyService.lista();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Consulta por ID no banco de dados")
    public Any buscarPorId(@PathVariable("id") Long id){
        return anyService.buscarPorId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Any não encontrado"));
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remover por ID no banco de dados")
    public void remover(@PathVariable("id") Long id){
        anyService.buscarPorId(id)
                .map(any -> {
                    anyService.remover(id);
                    return Void.TYPE;
                }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Any não encontrado"));
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Atualizar por ID no banco de dados")
    public void atualiza(@PathVariable("id") Long id, @RequestBody Any any){
        anyService.buscarPorId(id)
                .map(anyFind -> {
                    modelMapper.map(any, anyFind);
                    return Void.TYPE;
                }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Any não encontrado"));
        anyService.salvar(any);
    }
}
