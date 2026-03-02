package br.com.guesthesong.guesthesong.service;

import br.com.guesthesong.guesthesong.model.CachedTrack;
import br.com.guesthesong.guesthesong.service.deezer.Response.ItunesSearchResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ItunesClient {

    private static final String ITUNES_URL =
            "https://itunes.apple.com/search?term=%s&entity=song&limit=50&country=US";

    public List<CachedTrack> search(String query) {
        try {
            String url = String.format(ITUNES_URL, query.replace(" ", "+"));
            RestTemplate restTemplate = new RestTemplate();
            ItunesSearchResponse response = restTemplate.getForObject(url, ItunesSearchResponse.class);

            if (response == null || response.getResults() == null) {
                log.warn("iTunes returned null response for query '{}'", query);
                return Collections.emptyList();
            }

            return response.getResults().stream()
                    .filter(t -> t.getPreviewUrl() != null && !t.getPreviewUrl().isBlank())
                    .map(t -> CachedTrack.builder()
                            .title(t.getTrackName())
                            .artist(t.getArtistName())
                            .previewUrl(t.getPreviewUrl())
                            .build())
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.warn("iTunes fallback failed for query '{}': {}", query, e.getMessage());
            return Collections.emptyList();
        }
    }
}
