package br.com.guesthesong.guesthesong.service.deezer;

import br.com.guesthesong.guesthesong.config.DeezerConfig;
import br.com.guesthesong.guesthesong.service.deezer.Response.DeezerDataResponse;
import br.com.guesthesong.guesthesong.service.deezer.Response.DeezerResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
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
        var url = deezerConfig.getUrl() + "search?q="+ cantorOuMusica.replace(" ", "+");
        List<DeezerResponse> deezerResponseList = new ArrayList<DeezerResponse>();
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add(deezerConfig.getHeaderHost(), deezerConfig.getHost());
        headers.add(deezerConfig.getHeaderKey(), deezerConfig.getKey());
        HttpEntity<String> entity = new HttpEntity<>("body", headers);

        var response = restTemplate.exchange(url, HttpMethod.GET, entity, DeezerDataResponse.class).getBody().getDeezerResponses();
        for (int i = 0; i < 10; i++) {
            try {
                var deezerResponse = DeezerResponse.builder()
                        .artista(response.get(i).getArtista())
                        .titulo(response.get(i).getTitulo())
                        .linkPlayer(response.get(i).getLinkPlayer())
                        .build();
                deezerResponseList.add(deezerResponse);
            }catch (Exception e){
                log.info("Warning not exists 10 musics");
            }

        }
        deezerDataResponse.setDeezerResponses(deezerResponseList);

        log.info("Deezer response: {}", String.valueOf(deezerDataResponse));

        return deezerDataResponse;
    }



}
