package br.com.guesthesong.guesthesong.service;

import br.com.guesthesong.guesthesong.model.CustomQuizTrack;
import br.com.guesthesong.guesthesong.repository.CustomQuizTrackRepository;
import br.com.guesthesong.guesthesong.service.deezer.DeezerClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Ao iniciar o servidor, detecta todas as tracks com URL de preview expirada
 * (contêm "hdnea=") e rebusca no Deezer para obter uma URL permanente.
 * Roda em thread separada para não atrasar o boot.
 */
@Slf4j
@Component
public class PreviewUrlMigrationService {

    @Autowired private CustomQuizTrackRepository trackRepository;
    @Autowired private DeezerClient deezerClient;

    @Async
    @EventListener(ApplicationReadyEvent.class)
    public void fixExpiredPreviewUrls() {
        List<CustomQuizTrack> expired = trackRepository.findAllWithExpiredPreview();
        if (expired.isEmpty()) {
            log.info("PreviewUrlMigration: nenhuma URL expirada encontrada.");
            return;
        }

        log.info("PreviewUrlMigration: {} tracks com URL expirada. Iniciando correção...", expired.size());
        int fixed = 0;
        int failed = 0;

        for (CustomQuizTrack track : expired) {
            try {
                var results = deezerClient.search(track.getTitle() + " " + track.getArtist()).getDeezerResponses();
                boolean found = false;
                for (var r : results) {
                    String fresh = toHttps(r.getLinkPlayer());
                    if (fresh != null && !fresh.isBlank() && !fresh.contains("hdnea=")) {
                        track.setPreviewUrl(fresh);
                        trackRepository.save(track);
                        fixed++;
                        found = true;
                        break;
                    }
                }
                if (!found) failed++;

                // Pausa entre buscas para não ultrapassar o rate limit do Deezer
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

    private String toHttps(String url) {
        if (url != null && url.startsWith("http://")) return "https://" + url.substring(7);
        return url;
    }
}
