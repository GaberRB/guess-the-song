package br.com.guesthesong.guesthesong.service;

import br.com.guesthesong.guesthesong.model.*;
import br.com.guesthesong.guesthesong.repository.*;
import br.com.guesthesong.guesthesong.service.deezer.DeezerClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class CustomQuizService {

    @Autowired private CustomQuizRepository quizRepository;
    @Autowired private CustomQuizTrackRepository trackRepository;
    @Autowired private CustomScoreRepository scoreRepository;
    @Autowired private CustomQuizCacheService customQuizCacheService;
    @Autowired private DeezerClient deezerClient;
    @Autowired private QuizMusic quizMusic;
    @Autowired private DataQuizMusic dataQuizMusic;

    public Map<String, String> create(CreateQuizRequest request) {
        String quizId     = UUID.randomUUID().toString();
        String adminToken = UUID.randomUUID().toString();
        String now        = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        String expiresAt  = LocalDateTime.now().plusDays(30).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

        CustomQuiz quiz = CustomQuiz.builder()
                .id(quizId)
                .adminToken(adminToken)
                .name(request.getName())
                .creatorName(request.getCreatorName())
                .createdAt(now)
                .expiresAt(expiresAt)
                .build();
        quizRepository.save(quiz);

        for (TrackDto t : request.getTracks()) {
            trackRepository.save(CustomQuizTrack.builder()
                    .quizId(quizId)
                    .title(t.getTitle())
                    .artist(t.getArtist())
                    .previewUrl(toHttps(t.getPreviewUrl()))
                    .build());
        }

        Map<String, String> result = new LinkedHashMap<>();
        result.put("quizId", quizId);
        result.put("adminToken", adminToken);
        return result;
    }

    public CustomQuiz getInfo(String quizId) {
        return quizRepository.findById(quizId)
                .filter(q -> LocalDateTime.parse(q.getExpiresAt(), DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                        .isAfter(LocalDateTime.now()))
                .orElse(null);
    }

    public DataQuizMusic generateQuestions(String quizId) {
        List<CustomQuizTrack> tracks = trackRepository.findByQuizId(quizId);
        int size = tracks.size();
        List<QuizMusic> quizMusics = new ArrayList<>();
        Random rnd = new Random();
        List<Integer> indices = new ArrayList<>();
        for (int i = 0; i < size; i++) indices.add(i);
        Collections.shuffle(indices, rnd);

        for (int i = 0; i < Math.min(10, size); i++) {
            CustomQuizTrack track = tracks.get(indices.get(i));
            String previewUrl = freshPreviewUrl(track);
            String correctAnswer = track.getTitle() + " - " + track.getArtist();
            List<String> incorrects = getIncorrects(tracks, indices.get(i), correctAnswer, rnd);

            quizMusics.add(QuizMusic.builder()
                    .question((i + 1) + " - Guess the song?")
                    .correctAnswer(correctAnswer)
                    .incorrectAnswers(incorrects)
                    .mp3Link(previewUrl)
                    .build());
        }

        dataQuizMusic.setQuizMusic(quizMusics);
        return dataQuizMusic;
    }

    /**
     * URLs do Deezer com token (hdnea=) expiram em ~15min.
     * Rebusca o preview pelo título+artista e atualiza o banco para a próxima chamada.
     */
    private String freshPreviewUrl(CustomQuizTrack track) {
        String url = track.getPreviewUrl();
        if (url == null || !url.contains("hdnea=")) return url;

        try {
            var results = deezerClient.search(track.getTitle() + " " + track.getArtist()).getDeezerResponses();
            for (var r : results) {
                String fresh = toHttps(r.getLinkPlayer());
                if (fresh != null && !fresh.isBlank() && !fresh.contains("hdnea=")) {
                    // Salva URL permanente no banco para não rebuscar sempre
                    track.setPreviewUrl(fresh);
                    trackRepository.save(track);
                    return fresh;
                }
            }
        } catch (Exception e) {
            log.warn("Não foi possível rebuscar preview para '{}': {}", track.getTitle(), e.getMessage());
        }
        return url; // retorna a expirada — melhor que nada
    }

    public Map<String, Integer> fixExpiredPreviews(String quizId) {
        List<CustomQuizTrack> tracks = trackRepository.findByQuizId(quizId);
        int fixed = 0, failed = 0;
        for (CustomQuizTrack track : tracks) {
            if (track.getPreviewUrl() == null || !track.getPreviewUrl().contains("hdnea=")) continue;
            String fresh = freshPreviewUrl(track);
            if (!fresh.contains("hdnea=")) fixed++; else failed++;
        }
        Map<String, Integer> result = new LinkedHashMap<>();
        result.put("fixed", fixed);
        result.put("failed", failed);
        return result;
    }

    private List<String> getIncorrects(List<CustomQuizTrack> tracks, int correctIndex, String correctAnswer, Random rnd) {
        List<String> incorrects = new ArrayList<>();
        Set<Integer> used = new HashSet<>();
        used.add(correctIndex);
        int size = tracks.size();
        int attempts = 0;

        while (incorrects.size() < 3 && attempts < size * 3) {
            attempts++;
            int idx = rnd.nextInt(size);
            if (used.contains(idx)) continue;
            String candidate = tracks.get(idx).getTitle() + " - " + tracks.get(idx).getArtist();
            if (candidate.equals(correctAnswer)) continue;
            used.add(idx);
            incorrects.add(candidate);
        }
        return incorrects;
    }

    public CustomScore saveScore(String quizId, String playerName, int totalScore, int correctCount) {
        CustomScore score = CustomScore.builder()
                .quizId(quizId)
                .playerName(playerName)
                .totalScore(totalScore)
                .correctCount(correctCount)
                .createdAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .build();
        return scoreRepository.save(score);
    }

    public List<CustomScore> getRanking(String quizId) {
        return scoreRepository.findTop10ByQuizIdOrderByTotalScoreDesc(quizId);
    }

    public boolean validateAdminToken(String quizId, String token) {
        return quizRepository.findById(quizId)
                .map(q -> q.getAdminToken().equals(token))
                .orElse(false);
    }

    public CustomQuiz rename(String quizId, String newName) {
        CustomQuiz quiz = quizRepository.findById(quizId).orElse(null);
        if (quiz == null) return null;
        quiz.setName(newName);
        return quizRepository.save(quiz);
    }

    public CustomQuizTrack addTrack(String quizId, TrackDto dto) {
        customQuizCacheService.evict(quizId);
        return trackRepository.save(CustomQuizTrack.builder()
                .quizId(quizId)
                .title(dto.getTitle())
                .artist(dto.getArtist())
                .previewUrl(toHttps(dto.getPreviewUrl()))
                .build());
    }

    private String toHttps(String url) {
        if (url != null && url.startsWith("http://")) {
            return "https://" + url.substring(7);
        }
        return url;
    }

    public void removeTrack(String quizId, Long trackId) {
        customQuizCacheService.evict(quizId);
        trackRepository.deleteById(trackId);
    }

    public List<CustomQuizTrack> getTracks(String quizId) {
        return trackRepository.findByQuizId(quizId);
    }
}
