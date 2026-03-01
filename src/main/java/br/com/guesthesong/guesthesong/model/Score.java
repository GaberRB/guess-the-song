package br.com.guesthesong.guesthesong.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity
@Table(name = "scores")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String playerName;
    private int totalScore;
    private int correctCount;
    private String genre;
    private String createdAt;
}
