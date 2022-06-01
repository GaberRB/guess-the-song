package br.com.guesthesong.guesthesong.service.deezer;

import br.com.guesthesong.guesthesong.model.DataQuizMusic;
import br.com.guesthesong.guesthesong.model.QuizMusic;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
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
                    .question(String.valueOf(i++) + " - Guess the song?")
                    .correctAnswer(deezerMusic.getTitulo())
                    .incorrectAnswers(incorrectAnswers)
                    .mp3Link(deezerMusic.getLinkPlayer())
                    .build();
            quizMusics.add(quizMusic);
        }

        dataQuizMusic.setQuizMusic(quizMusics);

        return dataQuizMusic;
    }

}
