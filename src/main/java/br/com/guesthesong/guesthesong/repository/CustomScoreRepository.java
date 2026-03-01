package br.com.guesthesong.guesthesong.repository;

import br.com.guesthesong.guesthesong.model.CustomScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomScoreRepository extends JpaRepository<CustomScore, Long> {
    List<CustomScore> findTop10ByQuizIdOrderByTotalScoreDesc(String quizId);
}
