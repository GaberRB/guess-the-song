package br.com.guesthesong.guesthesong.service.deezer.Response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItunesTrackItem {

    @JsonProperty("trackName")
    private String trackName;

    @JsonProperty("artistName")
    private String artistName;

    @JsonProperty("previewUrl")
    private String previewUrl;
}
