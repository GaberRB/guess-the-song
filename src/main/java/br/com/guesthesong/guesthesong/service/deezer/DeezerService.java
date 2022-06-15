package br.com.guesthesong.guesthesong.service.deezer;

import br.com.guesthesong.guesthesong.model.DataQuizMusic;
import br.com.guesthesong.guesthesong.model.QuizMusic;
import br.com.guesthesong.guesthesong.service.deezer.Response.DeezerResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

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

    public DataQuizMusic findPlaylistOnDeezerApi(String playlist){

        List<QuizMusic> quizMusics = new ArrayList<QuizMusic>();
        var response = deezerClient.searchPlaylist(playlist);
        var i = 0;
        Random generator = new Random();
        var deezer = response.getDeezerResponses();
        var size = response.getDeezerResponses().size();

        for (int j = 0; j < 10; j++) {
            var randCorrect = generator.nextInt(size);
            var deezerMusic = deezer.get(randCorrect);

            quizMusic = QuizMusic.builder()
                    .question(String.valueOf(i++) + " - Guess the song?")
                    .correctAnswer(deezerMusic.getTitulo() +" - "+ deezerMusic.getArtista().getNome())
                    .incorrectAnswers(getIncorrets(deezer))
                    .mp3Link(deezerMusic.getLinkPlayer())
                    .build();
            quizMusics.add(quizMusic);
        }


        dataQuizMusic.setQuizMusic(quizMusics);

        return dataQuizMusic;
    }

    private List<String> getIncorrets(List<DeezerResponse> deezer){
        List<String> incorrectAnswers = new ArrayList<>();
        Random generator = new Random();
        var size = deezer.size();
        var randIncorrect = generator.nextInt(size);
        for (int k = 0; k < 3; k++) {
            incorrectAnswers.add(deezer.get(randIncorrect + k).getTitulo() +" - "+ deezer.get(randIncorrect + k).getArtista().getNome());
        }
        return incorrectAnswers;
    }

}
