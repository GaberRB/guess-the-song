package br.com.guesthesong.guesthesong.controller;

import br.com.guesthesong.guesthesong.service.AnyService;
import br.com.guesthesong.guesthesong.service.deezer.DeezerClient;
import br.com.guesthesong.guesthesong.service.deezer.Response.DeezerResponse;
import io.swagger.annotations.ApiOperation;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;


@RestController
@RequestMapping("/api/deezer/v1")
public class DeezerController {

    @Autowired
    private AnyService anyService;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private DeezerClient deezerClient;

    @GetMapping("/{cantorOuMusica}")
    @ResponseStatus(HttpStatus.OK)
    @ApiOperation(value = "deezerBuscar")
    public DeezerResponse deezerBuscar(@PathVariable("cantorOuMusica") String cantorOuMusica) throws IOException {
        return deezerClient.search(cantorOuMusica);
    }

}
