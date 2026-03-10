package br.com.guesthesong.guesthesong.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import javax.persistence.*;

@Data @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "wordle_scores", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"playerName", "gameDate"})
})
public class WordleScore {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @Column(nullable = false)
    private String playerName;
    @Column(nullable = false)
    private String gameDate;   // yyyy-MM-dd
    @Column(nullable = false)
    private int attempts;      // 1-6, 7 = failed
    @Column(nullable = false)
    private boolean solved;
    private String createdAt;
}
