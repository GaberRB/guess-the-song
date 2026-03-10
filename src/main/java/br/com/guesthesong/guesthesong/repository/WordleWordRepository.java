package br.com.guesthesong.guesthesong.repository;

import br.com.guesthesong.guesthesong.model.WordleWord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WordleWordRepository extends JpaRepository<WordleWord, Long> {
    List<WordleWord> findByActiveTrue();
    boolean existsByWord(String word);
}
