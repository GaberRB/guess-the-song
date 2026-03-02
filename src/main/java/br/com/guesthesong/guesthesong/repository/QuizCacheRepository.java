package br.com.guesthesong.guesthesong.repository;

import br.com.guesthesong.guesthesong.model.QuizCache;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizCacheRepository extends JpaRepository<QuizCache, String> {
}
