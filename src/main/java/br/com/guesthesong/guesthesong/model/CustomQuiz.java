package br.com.guesthesong.guesthesong.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity
@Table(name = "custom_quiz")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CustomQuiz {

    @Id
    private String id;

    private String adminToken;
    private String name;
    private String creatorName;
    private String createdAt;
    private String expiresAt;
}
