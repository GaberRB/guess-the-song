package br.com.guesthesong.guesthesong.service.deezer.Response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeezerDataResponse {

    @JsonProperty("data")
    private List<DeezerResponse> deezerResponses;
}
