package br.com.guesthesong.guesthesong.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "custom_quiz_cache")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomQuizCache {

    @Id
    private String quizId;

    @Column(columnDefinition = "TEXT")
    private String jsonValue;

    private String expiresAt;
}
