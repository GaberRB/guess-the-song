package br.com.guesthesong.guesthesong.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import javax.persistence.*;

@Data @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "wordle_words")
public class WordleWord {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @Column(nullable = false, length = 10)
    private String word;
    @Column(nullable = false)
    private boolean active = true;
}
