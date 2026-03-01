package br.com.guesthesong.guesthesong.service.deezer;

import br.com.guesthesong.guesthesong.model.DataQuizMusic;
import br.com.guesthesong.guesthesong.model.QuizMusic;
import br.com.guesthesong.guesthesong.service.deezer.Response.DeezerResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
public class DeezerService {

    @Autowired
    private DeezerClient deezerClient;

    @Autowired
    private QuizMusic quizMusic;

    @Autowired
    private DataQuizMusic dataQuizMusic;

    public DataQuizMusic findMusicOnDeezerApi(String singerOrMusic){
        List<String> incorrectAnswers = Arrays.asList("Wrong Music", "Wrong Music", "Wrong Music");
        List<QuizMusic> quizMusics = new ArrayList<QuizMusic>();
        var response = deezerClient.search(singerOrMusic);
        var i = 0;
        for (var deezerMusic:response.getDeezerResponses()) {
            quizMusic = QuizMusic.builder()
                    .question(String.valueOf(i+ 1) + " - Guess the song?")
                    .correctAnswer(deezerMusic.getTitulo())
                    .incorrectAnswers(incorrectAnswers)
                    .mp3Link(deezerMusic.getLinkPlayer())
                    .build();
            quizMusics.add(quizMusic);
        }

        dataQuizMusic.setQuizMusic(quizMusics);

        return dataQuizMusic;
    }

    public DataQuizMusic findBySearch(String query) {
        List<QuizMusic> quizMusics = new ArrayList<>();
        var response = deezerClient.search(query);
        Random generator = new Random();
        var deezer = response.getDeezerResponses();
        var size = deezer.size();
        Set<Integer> usedIndices = new HashSet<>();
        int count = 0;

        for (int attempts = 0; count < 10 && attempts < size * 3; attempts++) {
            int randCorrect = generator.nextInt(size);
            if (usedIndices.contains(randCorrect)) continue;
            usedIndices.add(randCorrect);

            var deezerMusic = deezer.get(randCorrect);
            var correctAnswer = deezerMusic.getTitulo() + " - " + deezerMusic.getArtista().getNome();

            quizMusic = QuizMusic.builder()
                    .question(String.valueOf(count + 1) + " - Guess the song?")
                    .correctAnswer(correctAnswer)
                    .incorrectAnswers(getIncorrets(deezer, randCorrect, correctAnswer))
                    .mp3Link(deezerMusic.getLinkPlayer())
                    .build();
            quizMusics.add(quizMusic);
            count++;
        }

        dataQuizMusic.setQuizMusic(quizMusics);
        return dataQuizMusic;
    }

    public DataQuizMusic findPlaylistOnDeezerApi(String playlist){

        List<QuizMusic> quizMusics = new ArrayList<>();
        var response = deezerClient.searchPlaylist(playlist);
        Random generator = new Random();
        var deezer = response.getDeezerResponses();
        var size = deezer.size();
        Set<Integer> usedIndices = new HashSet<>();
        int count = 0;

        for (int attempts = 0; count < 10 && attempts < size * 3; attempts++) {
            int randCorrect = generator.nextInt(size);
            if (usedIndices.contains(randCorrect)) continue;
            usedIndices.add(randCorrect);

            var deezerMusic = deezer.get(randCorrect);
            var correctAnswer = deezerMusic.getTitulo() + " - " + deezerMusic.getArtista().getNome();

            quizMusic = QuizMusic.builder()
                    .question(String.valueOf(count + 1) + " - Guess the song?")
                    .correctAnswer(correctAnswer)
                    .incorrectAnswers(getIncorrets(deezer, randCorrect, correctAnswer))
                    .mp3Link(deezerMusic.getLinkPlayer())
                    .build();
            quizMusics.add(quizMusic);
            count++;
        }

        dataQuizMusic.setQuizMusic(quizMusics);
        return dataQuizMusic;
    }

    private List<String> getIncorrets(List<DeezerResponse> deezer, int correctIndex, String correctAnswer) {
        List<String> incorrectAnswers = new ArrayList<>();
        Random generator = new Random();
        int size = deezer.size();
        Set<Integer> usedIndices = new HashSet<>();
        usedIndices.add(correctIndex);
        int attempts = 0;

        while (incorrectAnswers.size() < 3 && attempts < size * 2) {
            attempts++;
            int randIndex = generator.nextInt(size);
            if (usedIndices.contains(randIndex)) continue;
            String candidate = deezer.get(randIndex).getTitulo() + " - " + deezer.get(randIndex).getArtista().getNome();
            if (candidate.equals(correctAnswer)) continue;
            usedIndices.add(randIndex);
            incorrectAnswers.add(candidate);
        }

        return incorrectAnswers;
    }

}
