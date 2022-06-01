package br.com.guesthesong.guesthesong.controller;

import br.com.guesthesong.guesthesong.model.DataQuizMusic;
import br.com.guesthesong.guesthesong.service.AnyService;
import br.com.guesthesong.guesthesong.service.deezer.DeezerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Api do Dezzer, aqui buscamos uma musica/cantor")
@RestController
@RequestMapping("/api/deezer/v1")
public class DeezerController {

    @Autowired
    private AnyService anyService;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private DeezerService deezerService;

    @GetMapping("/{cantorOuMusica}")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Realizar a busca no deezer")
    public DataQuizMusic deezerBuscar(@PathVariable("cantorOuMusica") String cantorOuMusica) {
        return deezerService.findMusicOnDeezerApi(cantorOuMusica);
    }

}
