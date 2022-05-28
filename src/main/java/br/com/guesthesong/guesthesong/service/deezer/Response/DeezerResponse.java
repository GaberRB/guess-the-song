package br.com.guesthesong.guesthesong.service.deezer.Response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeezerResponse {

    @JsonProperty("title_short")
    private String titulo;
    @JsonProperty("preview")
    private String linkPlayer;
    @JsonProperty("artist")
    private ArtistaDeezerResponse artista;
}
