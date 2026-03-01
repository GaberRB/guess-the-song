package br.com.guesthesong.guesthesong.repository;

import br.com.guesthesong.guesthesong.model.CustomQuizTrack;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomQuizTrackRepository extends JpaRepository<CustomQuizTrack, Long> {
    List<CustomQuizTrack> findByQuizId(String quizId);
}
