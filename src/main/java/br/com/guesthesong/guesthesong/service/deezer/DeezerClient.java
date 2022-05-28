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

import java.io.IOException;

@Slf4j
@Service
public class DeezerClient {

    @Autowired
    private DeezerConfig deezerConfig;

    public DeezerResponse search(String cantorOuMusica) throws IOException {
        var url = deezerConfig.getUrl() + "search?q="+ cantorOuMusica.replace(" ", "+");
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add(deezerConfig.getHeaderHost(), deezerConfig.getHost());
        headers.add(deezerConfig.getHeaderKey(), deezerConfig.getKey());
        HttpEntity<String> entity = new HttpEntity<>("body", headers);

        var response = restTemplate.exchange(url, HttpMethod.GET, entity, DeezerDataResponse.class);
        log.info("Deezer response: {}", String.valueOf(response) );

        return response.getBody().getDeezerResponses().get(0);
    }



}
