package br.com.guesthesong.guesthesong.controller;

import br.com.guesthesong.guesthesong.model.Score;
import br.com.guesthesong.guesthesong.service.ScoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@Tag(name = "Score - Ranking global")
@RestController
@RequestMapping("/api/score/v1")
public class ScoreController {

    @Autowired
    private ScoreService scoreService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Salvar pontuação de uma partida")
    public Score save(@RequestBody Score score) {
        return scoreService.save(score);
    }

    @GetMapping("/top")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Top 10 pontuações globais")
    public List<Score> getTopScores() {
        return scoreService.getTopScores();
    }
}
