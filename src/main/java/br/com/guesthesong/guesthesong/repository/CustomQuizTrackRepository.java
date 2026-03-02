package br.com.guesthesong.guesthesong.repository;

import br.com.guesthesong.guesthesong.model.CustomQuizTrack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CustomQuizTrackRepository extends JpaRepository<CustomQuizTrack, Long> {
    List<CustomQuizTrack> findByQuizId(String quizId);

    @Query("SELECT t FROM CustomQuizTrack t WHERE t.previewUrl LIKE '%hdnea=%'")
    List<CustomQuizTrack> findAllWithExpiredPreview();
}
