package br.com.guesthesong.guesthesong.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity
@Table(name = "custom_quiz_track")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CustomQuizTrack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String quizId;
    private String title;
    private String artist;
    private String previewUrl;
}
