package br.com.guesthesong.guesthesong.repository;

import br.com.guesthesong.guesthesong.model.Score;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScoreRepository extends JpaRepository<Score, Long> {

    List<Score> findTop10ByOrderByTotalScoreDesc();
}
