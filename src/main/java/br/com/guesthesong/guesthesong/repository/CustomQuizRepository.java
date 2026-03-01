package br.com.guesthesong.guesthesong.repository;

import br.com.guesthesong.guesthesong.model.CustomQuiz;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomQuizRepository extends JpaRepository<CustomQuiz, String> {
}
