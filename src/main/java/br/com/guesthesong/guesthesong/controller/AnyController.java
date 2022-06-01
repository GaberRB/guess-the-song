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

@Tag(name = "Any classes with Any is for you to copy and use as a reference")
@RestController
@RequestMapping("/api/any/v1")
public class AnyController {

    @Autowired
    private AnyService anyService;

    @Autowired
    private ModelMapper modelMapper;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Save in database")
    public Any save(Any any){
        return anyService.salvar(any);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Find all in database")
    public List<Any> findAll(){
        return anyService.lista();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "find by id in database")
    public Any findById(@PathVariable("id") Long id){
        return anyService.buscarPorId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Any não encontrado"));
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "delete by id in database")
    public void delete(@PathVariable("id") Long id){
        anyService.buscarPorId(id)
                .map(any -> {
                    anyService.remover(id);
                    return Void.TYPE;
                }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Any não encontrado"));
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Update by id in database")
    public void update(@PathVariable("id") Long id, @RequestBody Any any){
        anyService.buscarPorId(id)
                .map(anyFind -> {
                    modelMapper.map(any, anyFind);
                    return Void.TYPE;
                }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Any não encontrado"));
        anyService.salvar(any);
    }
}
