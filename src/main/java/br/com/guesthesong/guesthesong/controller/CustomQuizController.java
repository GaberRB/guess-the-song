package br.com.guesthesong.guesthesong.controller;

import br.com.guesthesong.guesthesong.model.*;
import br.com.guesthesong.guesthesong.service.CustomQuizService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@CrossOrigin
@Tag(name = "Custom Quiz - Quiz personalizado com link")
@RestController
@RequestMapping("/api/custom-quiz/v1")
public class CustomQuizController {

    @Autowired
    private CustomQuizService customQuizService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Criar quiz personalizado com 10 tracks")
    public Map<String, String> create(@RequestBody CreateQuizRequest request) {
        return customQuizService.create(request);
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Buscar informações do quiz (valida expiração)")
    public CustomQuiz getInfo(@PathVariable String id) {
        CustomQuiz quiz = customQuizService.getInfo(id);
        if (quiz == null) throw new ResponseStatusException(HttpStatus.GONE, "Quiz expirado ou não encontrado");
        return quiz;
    }

    @GetMapping("/{id}/questions")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Gerar 10 questões do quiz personalizado")
    public DataQuizMusic getQuestions(@PathVariable String id) {
        CustomQuiz quiz = customQuizService.getInfo(id);
        if (quiz == null) throw new ResponseStatusException(HttpStatus.GONE, "Quiz expirado ou não encontrado");
        return customQuizService.generateQuestions(id);
    }

    @PostMapping("/{id}/score")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Salvar pontuação no ranking do quiz")
    public CustomScore saveScore(@PathVariable String id, @RequestBody CustomScore score) {
        CustomQuiz quiz = customQuizService.getInfo(id);
        if (quiz == null) throw new ResponseStatusException(HttpStatus.GONE, "Quiz expirado ou não encontrado");
        return customQuizService.saveScore(id, score.getPlayerName(), score.getTotalScore(), score.getCorrectCount());
    }

    @GetMapping("/{id}/ranking")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Top 10 do quiz personalizado")
    public List<CustomScore> getRanking(@PathVariable String id) {
        return customQuizService.getRanking(id);
    }

    @GetMapping("/{id}/tracks")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Listar tracks do quiz (requer token de admin)")
    public List<CustomQuizTrack> getTracks(
            @PathVariable String id,
            @RequestHeader("X-Admin-Token") String adminToken) {
        if (!customQuizService.validateAdminToken(id, adminToken))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Token inválido");
        return customQuizService.getTracks(id);
    }

    @PostMapping("/{id}/track")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Adicionar track ao quiz (requer token de admin)")
    public CustomQuizTrack addTrack(
            @PathVariable String id,
            @RequestHeader("X-Admin-Token") String adminToken,
            @RequestBody TrackDto dto) {
        if (!customQuizService.validateAdminToken(id, adminToken))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Token inválido");
        return customQuizService.addTrack(id, dto);
    }

    @PatchMapping("/{id}/name")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Renomear quiz (requer token de admin)")
    public CustomQuiz rename(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @RequestHeader("X-Admin-Token") String adminToken) {
        if (!customQuizService.validateAdminToken(id, adminToken))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Token inválido");
        String newName = body.get("name");
        if (newName == null || newName.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome inválido");
        CustomQuiz quiz = customQuizService.rename(id, newName.trim());
        if (quiz == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz não encontrado");
        return quiz;
    }

    @DeleteMapping("/{id}/track/{trackId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remover track do quiz (requer token de admin)")
    public void removeTrack(
            @PathVariable String id,
            @PathVariable Long trackId,
            @RequestHeader("X-Admin-Token") String adminToken) {
        if (!customQuizService.validateAdminToken(id, adminToken))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Token inválido");
        customQuizService.removeTrack(id, trackId);
    }
}
