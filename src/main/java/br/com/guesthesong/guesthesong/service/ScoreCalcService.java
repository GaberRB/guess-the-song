package br.com.guesthesong.guesthesong.service;

public class ScoreCalcService {

    public int scoreCalc (boolean bWin , int timeLeft, int actualScore){
        int score = actualScore;
        int multFactor  = 5;
        if (bWin){
            score = score +100 + (timeLeft * multFactor);
        }
        return score;
    }
}
