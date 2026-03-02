package br.com.guesthesong.guesthesong.service.deezer;

import br.com.guesthesong.guesthesong.config.DeezerConfig;
import br.com.guesthesong.guesthesong.service.deezer.Response.DeezerDataResponse;
import br.com.guesthesong.guesthesong.service.deezer.Response.DeezerResponse;
import br.com.guesthesong.guesthesong.service.deezer.Response.DeezerTracksResponse;
import br.com.guesthesong.guesthesong.utils.PlaylistsDeezer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;


@Slf4j
@Service
public class DeezerClient {

    @Autowired
    private DeezerConfig deezerConfig;

    @Autowired
    private DeezerDataResponse deezerDataResponse;

    public DeezerDataResponse search(String cantorOuMusica) {
        var url = deezerConfig.getUrl() + "search?q=" + cantorOuMusica.replace(" ", "+");
        RestTemplate restTemplate = new RestTemplate();
        var response = restTemplate.getForObject(url, DeezerDataResponse.class).getDeezerResponses();
        var deezerResponseList = createAQuizWith10Questions(response);
        deezerDataResponse.setDeezerResponses(deezerResponseList);
        return deezerDataResponse;
    }

    public DeezerDataResponse fetchPublicPlaylist(String playlistId) {
        var url = deezerConfig.getUrl() + "playlist/" + playlistId + "/tracks?limit=100";
        RestTemplate restTemplate = new RestTemplate();
        var response = restTemplate.getForObject(url, DeezerDataResponse.class).getDeezerResponses();
        deezerDataResponse.setDeezerResponses(createAQuizWith10Questions(response));
        return deezerDataResponse;
    }

    public DeezerDataResponse searchPlaylist(String playlist) {
        var id = PlaylistsDeezer.findEnum(playlist).getId();
        var url = deezerConfig.getUrlPlaylist() + id;
        RestTemplate restTemplate = new RestTemplate();
        var response = restTemplate.getForObject(url, DeezerTracksResponse.class).getDeezerDataResponse();
        var deezerResponseList = createAQuizWith10Questions(response.getDeezerResponses());
        deezerDataResponse.setDeezerResponses(deezerResponseList);
        return deezerDataResponse;
    }



    private List<DeezerResponse> createAQuizWith10Questions(List<DeezerResponse> response){
        List<DeezerResponse> deezerResponseList = new ArrayList<DeezerResponse>();
        for (int i = 0; i < response.size(); i++) {
            if (!response.get(i).getLinkPlayer().isBlank()){
                try {
                    var deezerResponse = DeezerResponse.builder()
                            .artista(response.get(i).getArtista())
                            .titulo(response.get(i).getTitulo())
                            .linkPlayer(response.get(i).getLinkPlayer())
                            .build();
                    deezerResponseList.add(deezerResponse);
                }catch (Exception e){
                    log.info("Warning not exists musics");
                }

            }

        }
        return deezerResponseList;
    }

}
