package br.com.guesthesong.guesthesong.repository;

import br.com.guesthesong.guesthesong.model.WordleScore;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WordleScoreRepository extends JpaRepository<WordleScore, Long> {
    List<WordleScore> findTop10ByGameDateAndSolvedTrueOrderByAttemptsAscCreatedAtAsc(String gameDate);
    boolean existsByPlayerNameAndGameDate(String playerName, String gameDate);
}
