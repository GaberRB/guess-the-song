package br.com.guesthesong.guesthesong.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuizRequest {
    private String name;
    private String creatorName;
    private List<TrackDto> tracks;
}
