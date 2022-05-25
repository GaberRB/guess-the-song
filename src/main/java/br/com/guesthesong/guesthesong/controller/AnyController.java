package br.com.guesthesong.guesthesong.controller;

import br.com.guesthesong.guesthesong.model.Any;
import io.swagger.annotations.ApiOperation;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import br.com.guesthesong.guesthesong.service.AnyService;

import java.util.List;


@RestController
@RequestMapping("/api/any/v1")
public class AnyController {

    @Autowired
    private AnyService anyService;

    @Autowired
    private ModelMapper modelMapper;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @ApiOperation(value = "Salvar any na base")
    public Any salvar(Any any){
        return anyService.salvar(any);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    @ApiOperation(value = "Listar todos os any")
    public List<Any> lista(){
        return anyService.lista();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    @ApiOperation(value = "Buscar any por ID")
    public Any buscarPorId(@PathVariable("id") Long id){
        return anyService.buscarPorId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Any não encontrado"));
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @ApiOperation(value = "Remover any por ID")
    public void remover(@PathVariable("id") Long id){
        anyService.buscarPorId(id)
                .map(jogador -> {
                    anyService.remover(id);
                    return Void.TYPE;
                }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Any não encontrado"));
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @ApiOperation(value = "Atualizar any na base")
    public void atualiza(@PathVariable("id") Long id, @RequestBody Any any){
        anyService.buscarPorId(id)
                .map(anyFind -> {
                    modelMapper.map(any, anyFind);
                    return Void.TYPE;
                }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Any não encontrado"));
        anyService.salvar(any);
    }
}
