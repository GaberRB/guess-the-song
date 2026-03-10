package br.com.guesthesong.guesthesong.service;

import br.com.guesthesong.guesthesong.model.WordleScore;
import br.com.guesthesong.guesthesong.model.WordleWord;
import br.com.guesthesong.guesthesong.repository.WordleScoreRepository;
import br.com.guesthesong.guesthesong.repository.WordleWordRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
public class WordleService {

    @Autowired private WordleWordRepository wordRepo;
    @Autowired private WordleScoreRepository scoreRepo;

    private static final LocalDate EPOCH = LocalDate.of(2026, 1, 1);

    public String getDailyWord() {
        return getDailyWordByOffset(0);
    }

    public String getDailyWord2() {
        return getDailyWordByOffset(1);
    }

    /** Returns N distinct daily words for the progression mode (Solo→Duo→Quarteto→Desafio).
     *  Shuffles the word list with a deterministic seed (dayIndex) so consecutive words
     *  are never alphabetically adjacent, then picks the first N. */
    public List<String> getDailyWords(int count) {
        List<WordleWord> words = wordRepo.findByActiveTrue();
        if (words.isEmpty()) throw new IllegalStateException("Nenhuma palavra cadastrada");
        words.sort(Comparator.comparing(WordleWord::getId));
        long dayIndex = ChronoUnit.DAYS.between(EPOCH, LocalDate.now());
        List<WordleWord> shuffled = new ArrayList<>(words);
        Collections.shuffle(shuffled, new Random(dayIndex));
        List<String> result = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            result.add(shuffled.get(i).getWord().toUpperCase());
        }
        return result;
    }

    private String getDailyWordByOffset(int offset) {
        List<WordleWord> words = wordRepo.findByActiveTrue();
        if (words.isEmpty()) throw new IllegalStateException("Nenhuma palavra cadastrada");
        words.sort(Comparator.comparing(WordleWord::getId));
        long dayIndex = ChronoUnit.DAYS.between(EPOCH, LocalDate.now());
        int index = (int)((dayIndex * 2 + offset * 1009) % words.size());
        return words.get(index).getWord().toUpperCase();
    }

    public String getTodayDate() {
        return LocalDate.now().toString();
    }

    public List<String> checkGuess(String guess) {
        String word = getDailyWord();
        char[] guessChars = guess.toUpperCase().toCharArray();
        char[] wordChars  = word.toCharArray();
        String[] result   = new String[5];

        // Pass 1: correct positions
        boolean[] wordUsed  = new boolean[5];
        boolean[] guessUsed = new boolean[5];
        for (int i = 0; i < 5; i++) {
            if (guessChars[i] == wordChars[i]) {
                result[i]    = "correct";
                wordUsed[i]  = true;
                guessUsed[i] = true;
            }
        }

        // Pass 2: present in wrong position
        for (int i = 0; i < 5; i++) {
            if (guessUsed[i]) continue;
            for (int j = 0; j < 5; j++) {
                if (!wordUsed[j] && guessChars[i] == wordChars[j]) {
                    result[i]   = "present";
                    wordUsed[j] = true;
                    break;
                }
            }
            if (result[i] == null) result[i] = "absent";
        }

        return Arrays.asList(result);
    }

    public List<String> checkGuess2(String guess) {
        String word = getDailyWord2();
        char[] guessChars = guess.toUpperCase().toCharArray();
        char[] wordChars  = word.toCharArray();
        String[] result   = new String[5];

        boolean[] wordUsed  = new boolean[5];
        boolean[] guessUsed = new boolean[5];
        for (int i = 0; i < 5; i++) {
            if (guessChars[i] == wordChars[i]) {
                result[i]    = "correct";
                wordUsed[i]  = true;
                guessUsed[i] = true;
            }
        }
        for (int i = 0; i < 5; i++) {
            if (guessUsed[i]) continue;
            for (int j = 0; j < 5; j++) {
                if (!wordUsed[j] && guessChars[i] == wordChars[j]) {
                    result[i]   = "present";
                    wordUsed[j] = true;
                    break;
                }
            }
            if (result[i] == null) result[i] = "absent";
        }
        return Arrays.asList(result);
    }

    public List<String> checkGuessAgainst(String guess, String word) {
        char[] guessChars = guess.toUpperCase().toCharArray();
        char[] wordChars  = word.toUpperCase().toCharArray();
        String[] result   = new String[5];
        boolean[] wordUsed  = new boolean[5];
        boolean[] guessUsed = new boolean[5];
        for (int i = 0; i < 5; i++) {
            if (guessChars[i] == wordChars[i]) {
                result[i] = "correct"; wordUsed[i] = true; guessUsed[i] = true;
            }
        }
        for (int i = 0; i < 5; i++) {
            if (guessUsed[i]) continue;
            for (int j = 0; j < 5; j++) {
                if (!wordUsed[j] && guessChars[i] == wordChars[j]) {
                    result[i] = "present"; wordUsed[j] = true; break;
                }
            }
            if (result[i] == null) result[i] = "absent";
        }
        return Arrays.asList(result);
    }

    public boolean isValidWord(String word) {
        return wordRepo.existsByWord(word.toUpperCase());
    }

    public WordleScore saveScore(String playerName, int attempts, boolean solved) {
        String today = getTodayDate();
        // If player already has a score today, ignore (retry doesn't earn points)
        if (scoreRepo.existsByPlayerNameAndGameDate(playerName, today)) {
            return null;
        }
        WordleScore score = new WordleScore();
        score.setPlayerName(playerName);
        score.setGameDate(today);
        score.setAttempts(attempts);
        score.setSolved(solved);
        score.setCreatedAt(LocalDateTime.now().toString());
        return scoreRepo.save(score);
    }

    public List<WordleScore> getDailyRanking(String date) {
        return scoreRepo.findTop10ByGameDateAndSolvedTrueOrderByAttemptsAscCreatedAtAsc(date);
    }

    @javax.annotation.PostConstruct
    public void seedWords() {
        if (wordRepo.count() > 0) return;
        try {
            org.springframework.core.io.ClassPathResource res =
                    new org.springframework.core.io.ClassPathResource("wordle-words.txt");
            java.util.Scanner scanner = new java.util.Scanner(res.getInputStream());
            while (scanner.hasNextLine()) {
                String w = scanner.nextLine().trim().toUpperCase();
                if (w.length() == 5 && !w.isBlank()) {
                    WordleWord ww = new WordleWord();
                    ww.setWord(w);
                    ww.setActive(true);
                    wordRepo.save(ww);
                }
            }
            log.info("Wordle: {} palavras carregadas", wordRepo.count());
        } catch (Exception e) {
            log.warn("Wordle: falha ao carregar palavras: {}", e.getMessage());
        }
    }
}
