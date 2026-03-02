package br.com.guesthesong.guesthesong.service;

import br.com.guesthesong.guesthesong.model.CachedTrack;
import br.com.guesthesong.guesthesong.model.CustomQuizTrack;
import br.com.guesthesong.guesthesong.repository.CustomQuizTrackRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Ao iniciar o servidor, detecta todas as tracks com URL de preview expirada
 * (contêm "hdnea=") e rebusca no iTunes para obter uma URL permanente.
 * Roda em thread separada para não atrasar o boot.
 */
@Slf4j
@Component
public class PreviewUrlMigrationService {

    @Autowired private CustomQuizTrackRepository trackRepository;
    @Autowired private ItunesClient itunesClient;

    @Async
    @EventListener(ApplicationReadyEvent.class)
    public void fixExpiredPreviewUrls() {
        List<CustomQuizTrack> expired = trackRepository.findAllWithExpiredPreview();
        if (expired.isEmpty()) {
            log.info("PreviewUrlMigration: nenhuma URL expirada encontrada.");
            return;
        }

        log.info("PreviewUrlMigration: {} tracks com URL expirada. Iniciando correção via iTunes...", expired.size());
        int fixed = 0;
        int failed = 0;

        for (CustomQuizTrack track : expired) {
            try {
                List<CachedTrack> results = itunesClient.search(track.getTitle() + " " + track.getArtist());
                boolean found = false;
                for (CachedTrack r : results) {
                    String url = r.getPreviewUrl();
                    if (url != null && !url.isBlank()) {
                        track.setPreviewUrl(url);
                        trackRepository.save(track);
                        fixed++;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    log.warn("PreviewUrlMigration: sem resultado iTunes para '{}'", track.getTitle());
                    failed++;
                }

                // Pausa entre buscas para não ultrapassar o rate limit do iTunes
                Thread.sleep(300);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                log.warn("PreviewUrlMigration: falha ao corrigir '{}': {}", track.getTitle(), e.getMessage());
                failed++;
            }
        }

        log.info("PreviewUrlMigration: concluída. Corrigidas={}, Falhas={}", fixed, failed);
    }
}
