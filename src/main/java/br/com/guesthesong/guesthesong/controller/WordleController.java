package br.com.guesthesong.guesthesong.controller;

import br.com.guesthesong.guesthesong.model.WordleScore;
import br.com.guesthesong.guesthesong.service.WordleService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin
@Tag(name = "Wordle BR API")
@RestController
@RequestMapping("/api/wordle/v1")
public class WordleController {

    @Autowired private WordleService wordleService;

    @GetMapping("/daily")
    public Map<String, Object> getDaily() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("date", wordleService.getTodayDate());
        resp.put("wordLength", 5);
        return resp;
    }

    @PostMapping("/guess")
    public Map<String, Object> checkGuess(@RequestBody Map<String, String> body) {
        String guess = body.get("guess");
        if (guess == null || guess.length() != 5) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "Palavra deve ter 5 letras");
            return err;
        }
        List<String> result = wordleService.checkGuess(guess);
        Map<String, Object> resp = new HashMap<>();
        resp.put("result", result);
        boolean won = result.stream().allMatch(r -> r.equals("correct"));
        if (won) {
            resp.put("word", wordleService.getDailyWord());
        }
        return resp;
    }

    @PostMapping("/guess2")
    public Map<String, Object> checkGuess2(@RequestBody Map<String, String> body) {
        String guess = body.get("guess");
        if (guess == null || guess.length() != 5) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "Palavra deve ter 5 letras");
            return err;
        }
        List<String> result = wordleService.checkGuess2(guess);
        Map<String, Object> resp = new HashMap<>();
        resp.put("result", result);
        boolean won = result.stream().allMatch(r -> r.equals("correct"));
        if (won) {
            resp.put("word", wordleService.getDailyWord2());
        }
        return resp;
    }

    /** Progression mode: check guess against word at given index (0-12) */
    @PostMapping("/guess-stage")
    public Map<String, Object> checkGuessStage(@RequestBody Map<String, Object> body) {
        String guess = (String) body.get("guess");
        int wordIndex = body.containsKey("wordIndex") ? (int) body.get("wordIndex") : 0;
        if (guess == null || guess.length() != 5) {
            return Collections.singletonMap("error", "Palavra deve ter 5 letras");
        }
        if (wordIndex < 0 || wordIndex > 12) {
            return Collections.singletonMap("error", "Indice invalido");
        }
        List<String> dailyWords = wordleService.getDailyWords(13);
        String target = dailyWords.get(wordIndex);
        List<String> result = wordleService.checkGuessAgainst(guess, target);
        Map<String, Object> resp = new HashMap<>();
        resp.put("result", result);
        boolean won = result.stream().allMatch(r -> r.equals("correct"));
        if (won) resp.put("word", target);
        return resp;
    }

    /** Returns all 13 daily words (for reveal on game-over) */
    @GetMapping("/words-of-day")
    public Map<String, Object> getWordsOfDay() {
        List<String> words = wordleService.getDailyWords(13);
        Map<String, Object> resp = new HashMap<>();
        resp.put("words", words);
        resp.put("date", wordleService.getTodayDate());
        return resp;
    }

    @GetMapping("/validate")
    public Map<String, Boolean> validate(@RequestParam String word) {
        return Collections.singletonMap("valid", wordleService.isValidWord(word));
    }

    @GetMapping("/word-of-day")
    public Map<String, String> getWordOfDay() {
        return Collections.singletonMap("word", wordleService.getDailyWord());
    }

    @PostMapping("/score")
    public WordleScore saveScore(@RequestBody Map<String, Object> body) {
        String playerName = (String) body.get("playerName");
        int attempts      = (int) body.get("attempts");
        boolean solved    = (boolean) body.get("solved");
        return wordleService.saveScore(playerName, attempts, solved);
    }

    @GetMapping("/ranking")
    public List<WordleScore> getRanking(@RequestParam(required = false) String date) {
        String d = (date != null && !date.isBlank()) ? date : wordleService.getTodayDate();
        return wordleService.getDailyRanking(d);
    }
}
