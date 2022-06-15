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

@CrossOrigin
@Tag(name = "Dezzer api, here we are looking for a song/singer")
@RestController
@RequestMapping("/api/quiz/v1")
public class DeezerController {

    @Autowired
    private AnyService anyService;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private DeezerService deezerService;

//    @GetMapping("/{songOrsinger}")
//    @ResponseStatus(HttpStatus.OK)
//    @Operation(summary = "Search on deezer")
//    public DataQuizMusic deezerFindBySong(@PathVariable("songOrsinger") String songOrsinger) {
//        return deezerService.findMusicOnDeezerApi(songOrsinger);
//    }

    @GetMapping("/{playlist}")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Playlist on deezer")
    public DataQuizMusic deezerFindByplaylist(@PathVariable("playlist") String songOrsinger) {
        return deezerService.findPlaylistOnDeezerApi(songOrsinger);
    }

}
