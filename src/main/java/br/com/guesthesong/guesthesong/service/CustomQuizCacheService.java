package br.com.guesthesong.guesthesong.service;

import br.com.guesthesong.guesthesong.model.CachedTrack;
import br.com.guesthesong.guesthesong.model.CustomQuizCache;
import br.com.guesthesong.guesthesong.model.CustomQuizTrack;
import br.com.guesthesong.guesthesong.repository.CustomQuizCacheRepository;
import br.com.guesthesong.guesthesong.repository.CustomQuizTrackRepository;
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
import java.util.stream.Collectors;

@Slf4j
@Service
public class CustomQuizCacheService {

    private static final int TTL_DAYS = 15;

    @Autowired
    private CustomQuizCacheRepository cacheRepository;

    @Autowired
    private CustomQuizTrackRepository trackRepository;

    @Autowired
    private ObjectMapper objectMapper;

    public List<CachedTrack> getOrLoad(String quizId) {
        Optional<CustomQuizCache> cached = cacheRepository.findById(quizId);

        if (cached.isPresent()) {
            CustomQuizCache entry = cached.get();
            LocalDateTime expiresAt = LocalDateTime.parse(
                    entry.getExpiresAt(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);

            if (expiresAt.isAfter(LocalDateTime.now())) {
                log.debug("Custom quiz cache HIT for '{}'", quizId);
                List<CachedTrack> pool = deserialize(entry.getJsonValue());
                if (!pool.isEmpty()) return pool;
            } else {
                log.debug("Custom quiz cache EXPIRED for '{}'", quizId);
            }
        }

        log.debug("Custom quiz cache MISS for '{}'", quizId);
        return loadAndCache(quizId);
    }

    public void evict(String quizId) {
        cacheRepository.deleteById(quizId);
        log.debug("Custom quiz cache EVICTED for '{}'", quizId);
    }

    private List<CachedTrack> loadAndCache(String quizId) {
        List<CustomQuizTrack> tracks = trackRepository.findByQuizId(quizId);
        List<CachedTrack> pool = tracks.stream()
                .map(t -> CachedTrack.builder()
                        .title(t.getTitle())
                        .artist(t.getArtist())
                        .previewUrl(t.getPreviewUrl())
                        .build())
                .collect(Collectors.toList());

        try {
            String json = objectMapper.writeValueAsString(pool);
            String expiresAt = LocalDateTime.now()
                    .plusDays(TTL_DAYS)
                    .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

            cacheRepository.save(CustomQuizCache.builder()
                    .quizId(quizId)
                    .jsonValue(json)
                    .expiresAt(expiresAt)
                    .build());
            log.debug("Custom quiz cache SAVED for '{}' (expires {})", quizId, expiresAt);
        } catch (Exception e) {
            log.warn("Failed to save custom quiz cache for '{}': {}", quizId, e.getMessage());
        }

        return pool;
    }

    private List<CachedTrack> deserialize(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<CachedTrack>>() {});
        } catch (Exception e) {
            log.warn("Failed to deserialize custom quiz cache: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
