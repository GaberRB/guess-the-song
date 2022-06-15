package br.com.guesthesong.guesthesong.utils;

import lombok.Getter;

import java.util.HashMap;
import java.util.Map;

@Getter
public enum PlaylistsDeezer {

    WORLD("3155776842"),
    DOSE_POP("9204169122"),
    POP_BRASIL("691969187"),
    POP_OLD("4613095128"),
    POP_90("8311123682"),
    POP_00("4782034564"),
    ALTERNATIVO("668126235"),
    DANCE("6275137524"),
    ROCK("1306931615"),
    HARD_ROCK("1030833471"),
    METAL("2655390504"),
    METAL_80("1294679255"),
    METAL_90("1471284255"),
    METAL_00("2004964442"),
    METAL_10("1045800791"),
    METAL_HITS("1388965575");


    private final String id;
    private static final Map<String, PlaylistsDeezer> lookup = new HashMap<String, PlaylistsDeezer>();

    static {
        for(PlaylistsDeezer playlistsDeezer : PlaylistsDeezer.values()){
            lookup.put(playlistsDeezer.id, playlistsDeezer);
        }
    }

    PlaylistsDeezer(String id) {
        this.id = id;
    }

    public static PlaylistsDeezer findEnum(String playlist){
        return lookup.values().stream()
                .filter(playlistsDeezer -> playlistsDeezer.name().equalsIgnoreCase(playlist))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Erro ao buscar a playlist: " + playlist));
    }
}
