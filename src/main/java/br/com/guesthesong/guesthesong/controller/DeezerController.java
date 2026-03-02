package br.com.guesthesong.guesthesong.controller;

import br.com.guesthesong.guesthesong.model.DataQuizMusic;
import br.com.guesthesong.guesthesong.model.TrackDto;
import br.com.guesthesong.guesthesong.service.AnyService;
import br.com.guesthesong.guesthesong.service.deezer.DeezerClient;
import br.com.guesthesong.guesthesong.service.deezer.DeezerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

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

    @Autowired
    private DeezerClient deezerClient;

    @GetMapping("/search")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Search by artist or genre on deezer")
    public DataQuizMusic deezerSearch(@RequestParam("q") String query) {
        return deezerService.findBySearch(query);
    }

    @GetMapping("/tracks")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Search raw tracks by artist or song name (for custom quiz creation)")
    public List<TrackDto> searchTracks(@RequestParam("q") String query) {
        return deezerClient.search(query).getDeezerResponses().stream()
                .map(t -> TrackDto.builder()
                        .title(t.getTitulo())
                        .artist(t.getArtista().getNome())
                        .previewUrl(t.getLinkPlayer())
                        .build())
                .collect(Collectors.toList());
    }

    @GetMapping("/playlist-import")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Import tracks from a public Deezer playlist by numeric ID")
    public List<TrackDto> importDeezerPlaylist(@RequestParam("id") String playlistId) {
        return deezerClient.fetchPublicPlaylist(playlistId).getDeezerResponses().stream()
                .map(t -> TrackDto.builder()
                        .title(t.getTitulo())
                        .artist(t.getArtista().getNome())
                        .previewUrl(t.getLinkPlayer())
                        .build())
                .collect(Collectors.toList());
    }

    @GetMapping("/{playlist}")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Playlist on deezer")
    public DataQuizMusic deezerFindByplaylist(@PathVariable("playlist") String songOrsinger) {
        return deezerService.findPlaylistOnDeezerApi(songOrsinger);
    }

}
