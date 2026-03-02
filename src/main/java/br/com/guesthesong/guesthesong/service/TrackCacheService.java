package br.com.guesthesong.guesthesong.service;

import br.com.guesthesong.guesthesong.model.CachedTrack;
import br.com.guesthesong.guesthesong.model.QuizCache;
import br.com.guesthesong.guesthesong.repository.QuizCacheRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class TrackCacheService {

    private static final int TTL_MINUTES = 15;

    @Autowired
    private QuizCacheRepository cacheRepository;

    @Autowired
    private ItunesClient itunesClient;

    @Autowired
    private ObjectMapper objectMapper;

    @FunctionalInterface
    public interface TrackFetcher {
        List<CachedTrack> fetch() throws Exception;
    }

    public List<CachedTrack> getOrFetch(String cacheKey, TrackFetcher fetcher) {
        Optional<QuizCache> cached = cacheRepository.findById(cacheKey);

        if (cached.isPresent()) {
            QuizCache entry = cached.get();
            LocalDateTime expiresAt = LocalDateTime.parse(
                    entry.getExpiresAt(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);

            if (expiresAt.isAfter(LocalDateTime.now())) {
                log.debug("Cache HIT for key '{}'", cacheKey);
                List<CachedTrack> pool = deserialize(entry.getJsonValue());
                if (!pool.isEmpty()) return pool;
            } else {
                log.debug("Cache EXPIRED for key '{}'", cacheKey);
            }
        }

        log.debug("Cache MISS for key '{}'", cacheKey);
        List<CachedTrack> tracks = fetchWithFallback(cacheKey, fetcher);
        if (!tracks.isEmpty()) {
            save(cacheKey, tracks);
        }
        return tracks;
    }

    private List<CachedTrack> fetchWithFallback(String cacheKey, TrackFetcher fetcher) {
        try {
            List<CachedTrack> tracks = fetcher.fetch();
            if (!tracks.isEmpty()) {
                return tracks;
            }
            log.warn("Deezer returned empty results for '{}', trying iTunes", cacheKey);
        } catch (Exception e) {
            log.warn("Deezer failed for '{}': {}, trying iTunes fallback", cacheKey, e.getMessage());
        }

        // Fallback iTunes: remove prefixo "search:" se presente
        String itunesQuery = cacheKey.startsWith("search:")
                ? cacheKey.substring(7)
                : cacheKey;
        return itunesClient.search(itunesQuery);
    }

    private void save(String cacheKey, List<CachedTrack> tracks) {
        try {
            String json = objectMapper.writeValueAsString(tracks);
            String expiresAt = LocalDateTime.now()
                    .plusMinutes(TTL_MINUTES)
                    .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

            cacheRepository.save(QuizCache.builder()
                    .cacheKey(cacheKey)
                    .jsonValue(json)
                    .expiresAt(expiresAt)
                    .build());
            log.debug("Cache SAVED for key '{}' (expires {})", cacheKey, expiresAt);
        } catch (Exception e) {
            log.warn("Failed to save cache for '{}': {}", cacheKey, e.getMessage());
        }
    }

    private List<CachedTrack> deserialize(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<CachedTrack>>() {});
        } catch (Exception e) {
            log.warn("Failed to deserialize cache entry: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
