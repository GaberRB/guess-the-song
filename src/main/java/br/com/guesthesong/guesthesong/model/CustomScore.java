package br.com.guesthesong.guesthesong.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity
@Table(name = "custom_scores")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CustomScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String quizId;
    private String playerName;
    private int totalScore;
    private int correctCount;
    private String createdAt;
}
