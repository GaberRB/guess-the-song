package br.com.guesthesong.guesthesong.service;

import br.com.guesthesong.guesthesong.model.Score;
import br.com.guesthesong.guesthesong.repository.ScoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ScoreService {

    @Autowired
    private ScoreRepository scoreRepository;

    public Score save(Score score) {
        score.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return scoreRepository.save(score);
    }

    public List<Score> getTopScores() {
        return scoreRepository.findTop10ByOrderByTotalScoreDesc();
    }
}
