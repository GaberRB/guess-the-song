package br.com.guesthesong.guesthesong.service.deezer;

import br.com.guesthesong.guesthesong.model.CachedTrack;
import br.com.guesthesong.guesthesong.model.DataQuizMusic;
import br.com.guesthesong.guesthesong.model.QuizMusic;
import br.com.guesthesong.guesthesong.service.TrackCacheService;
import br.com.guesthesong.guesthesong.service.deezer.Response.DeezerResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class DeezerService {

    @Autowired
    private DeezerClient deezerClient;

    @Autowired
    private QuizMusic quizMusic;

    @Autowired
    private DataQuizMusic dataQuizMusic;

    @Autowired
    private TrackCacheService trackCacheService;

    public DataQuizMusic findBySearch(String query) {
        List<CachedTrack> pool = trackCacheService.getOrFetch(
                "search:" + query.toLowerCase(),
                () -> toCachedTracks(deezerClient.search(query).getDeezerResponses())
        );
        return buildQuiz(pool);
    }

    public DataQuizMusic findPlaylistOnDeezerApi(String playlist) {
        List<CachedTrack> pool = trackCacheService.getOrFetch(
                playlist.toUpperCase(),
                () -> toCachedTracks(deezerClient.searchPlaylist(playlist).getDeezerResponses())
        );
        return buildQuiz(pool);
    }

    // Método legado — mantido sem alteração
    public DataQuizMusic findMusicOnDeezerApi(String singerOrMusic) {
        List<String> incorrectAnswers = Arrays.asList("Wrong Music", "Wrong Music", "Wrong Music");
        List<QuizMusic> quizMusics = new ArrayList<>();
        var response = deezerClient.search(singerOrMusic);
        var i = 0;
        for (var deezerMusic : response.getDeezerResponses()) {
            quizMusic = QuizMusic.builder()
                    .question(String.valueOf(i + 1) + " - Guess the song?")
                    .correctAnswer(deezerMusic.getTitulo())
                    .incorrectAnswers(incorrectAnswers)
                    .mp3Link(deezerMusic.getLinkPlayer())
                    .build();
            quizMusics.add(quizMusic);
        }
        dataQuizMusic.setQuizMusic(quizMusics);
        return dataQuizMusic;
    }

    // Converte List<DeezerResponse> para List<CachedTrack>
    private List<CachedTrack> toCachedTracks(List<DeezerResponse> responses) {
        return responses.stream()
                .map(r -> CachedTrack.builder()
                        .title(r.getTitulo())
                        .artist(r.getArtista().getNome())
                        .previewUrl(toHttps(r.getLinkPlayer()))
                        .build())
                .collect(Collectors.toList());
    }

    // Constrói DataQuizMusic a partir de um pool de CachedTrack (sorteia 10, gera alternativas)
    private DataQuizMusic buildQuiz(List<CachedTrack> pool) {
        List<QuizMusic> quizMusics = new ArrayList<>();
        Random generator = new Random();
        int size = pool.size();

        if (size == 0) {
            dataQuizMusic.setQuizMusic(quizMusics);
            return dataQuizMusic;
        }

        Set<Integer> usedIndices = new HashSet<>();
        int count = 0;

        for (int attempts = 0; count < 10 && attempts < size * 3; attempts++) {
            int randCorrect = generator.nextInt(size);
            if (usedIndices.contains(randCorrect)) continue;
            usedIndices.add(randCorrect);

            CachedTrack track = pool.get(randCorrect);
            String correctAnswer = track.getTitle() + " - " + track.getArtist();

            quizMusic = QuizMusic.builder()
                    .question(String.valueOf(count + 1) + " - Guess the song?")
                    .correctAnswer(correctAnswer)
                    .incorrectAnswers(getIncorrects(pool, randCorrect, correctAnswer, generator))
                    .mp3Link(track.getPreviewUrl())
                    .build();
            quizMusics.add(quizMusic);
            count++;
        }

        dataQuizMusic.setQuizMusic(quizMusics);
        return dataQuizMusic;
    }

    private List<String> getIncorrects(List<CachedTrack> pool, int correctIndex,
                                       String correctAnswer, Random generator) {
        List<String> incorrectAnswers = new ArrayList<>();
        int size = pool.size();
        Set<Integer> usedIndices = new HashSet<>();
        usedIndices.add(correctIndex);
        int attempts = 0;

        while (incorrectAnswers.size() < 3 && attempts < size * 2) {
            attempts++;
            int randIndex = generator.nextInt(size);
            if (usedIndices.contains(randIndex)) continue;
            String candidate = pool.get(randIndex).getTitle() + " - " + pool.get(randIndex).getArtist();
            if (candidate.equals(correctAnswer)) continue;
            usedIndices.add(randIndex);
            incorrectAnswers.add(candidate);
        }

        return incorrectAnswers;
    }

    private String toHttps(String url) {
        if (url != null && url.startsWith("http://")) {
            return "https://" + url.substring(7);
        }
        return url;
    }
}
