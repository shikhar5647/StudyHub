import React, { useState, useCallback } from 'react';
import {
  FaArrowLeft,
  FaArrowRight,
  FaRedo,
  FaSyncAlt,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';

function FlashcardCard({ card, flipped, onFlip }) {
  return (
    <div
      className="flashcard-container mx-auto mb-4"
      style={{ perspective: '1000px', maxWidth: 560, cursor: 'pointer' }}
      onClick={onFlip}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: 280,
          transition: 'transform 0.5s',
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <div
          className="card border-primary shadow"
          style={{
            position: 'absolute',
            width: '100%',
            minHeight: 280,
            backfaceVisibility: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <span className="fw-semibold">Question</span>
            <FaSyncAlt size={14} className="opacity-75" />
          </div>
          <div className="card-body d-flex align-items-center justify-content-center p-4">
            <p className="text-center fs-5 mb-0">{card.front}</p>
          </div>
          <div className="card-footer bg-transparent text-center">
            <small className="text-muted">Click to reveal answer</small>
          </div>
        </div>

        <div
          className="card border-success shadow"
          style={{
            position: 'absolute',
            width: '100%',
            minHeight: 280,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
            <span className="fw-semibold">Answer</span>
            <FaSyncAlt size={14} className="opacity-75" />
          </div>
          <div className="card-body d-flex align-items-center justify-content-center p-4">
            <p className="text-center mb-0" style={{ whiteSpace: 'pre-wrap' }}>
              {card.back}
            </p>
          </div>
          <div className="card-footer bg-transparent text-center">
            <small className="text-muted">Click to see question</small>
          </div>
        </div>
      </div>
    </div>
  );
}

function McqCard({ card, selectedOption, onSelect }) {
  const answered = selectedOption !== null;
  const correctIndex = card.answer;

  return (
    <div className="mx-auto mb-4" style={{ maxWidth: 560 }}>
      <div className="card shadow border-0">
        <div className="card-header bg-info text-white">
          <span className="fw-semibold">Multiple Choice</span>
        </div>
        <div className="card-body p-4">
          <p className="fs-5 fw-semibold mb-4">{card.question}</p>
          <div className="d-flex flex-column gap-2">
            {card.options.map((option, i) => {
              let btnClass = 'btn btn-outline-secondary text-start w-100 py-2 px-3';
              let icon = null;

              if (answered) {
                if (i === correctIndex) {
                  btnClass = 'btn btn-success text-start w-100 py-2 px-3';
                  icon = <FaCheckCircle className="me-2 flex-shrink-0" />;
                } else if (i === selectedOption && i !== correctIndex) {
                  btnClass = 'btn btn-danger text-start w-100 py-2 px-3';
                  icon = <FaTimesCircle className="me-2 flex-shrink-0" />;
                } else {
                  btnClass = 'btn btn-outline-secondary text-start w-100 py-2 px-3 opacity-50';
                }
              } else if (i === selectedOption) {
                btnClass = 'btn btn-primary text-start w-100 py-2 px-3';
              }

              return (
                <button
                  key={i}
                  type="button"
                  className={btnClass}
                  onClick={() => !answered && onSelect(i)}
                  disabled={answered}
                >
                  <span className="d-flex align-items-center">
                    {icon}
                    <span className="fw-semibold me-2">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {answered && (
            <div
              className={`alert mt-3 mb-0 ${
                selectedOption === correctIndex ? 'alert-success' : 'alert-danger'
              }`}
            >
              {selectedOption === correctIndex
                ? 'Correct!'
                : `Incorrect. The correct answer is ${String.fromCharCode(65 + correctIndex)}. ${card.options[correctIndex]}`}
              {card.explanation && (
                <p className="mb-0 mt-2 small">{card.explanation}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const FlashcardQuiz = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(new Set());
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const card = cards[currentIndex];
  const isMcq = card.type === 'mcq';
  const total = cards.length;
  const progress = Math.round((completed.size / total) * 100);

  const flip = useCallback(() => setFlipped((f) => !f), []);

  const markCompleted = useCallback(() => {
    setCompleted((prev) => new Set(prev).add(currentIndex));
  }, [currentIndex]);

  const next = useCallback(() => {
    markCompleted();
    setFlipped(false);
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, total, markCompleted]);

  const prev = useCallback(() => {
    setFlipped(false);
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }, [currentIndex]);

  const restart = useCallback(() => {
    setCurrentIndex(0);
    setFlipped(false);
    setCompleted(new Set());
    setMcqAnswers({});
    setScore({ correct: 0, total: 0 });
  }, []);

  const handleMcqSelect = useCallback(
    (optionIndex) => {
      setMcqAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
      setCompleted((prev) => new Set(prev).add(currentIndex));
      const isCorrect = optionIndex === card.answer;
      setScore((prev) => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));
    },
    [currentIndex, card]
  );

  if (!cards || cards.length === 0) {
    return <p className="text-muted">No quiz questions available.</p>;
  }

  const allDone = completed.size === total;
  const mcqCount = cards.filter((c) => c.type === 'mcq').length;

  return (
    <div className="flashcard-quiz">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="small text-muted">
          Question {currentIndex + 1} of {total}
          {isMcq ? (
            <span className="badge bg-info ms-2">MCQ</span>
          ) : (
            <span className="badge bg-primary ms-2">Flashcard</span>
          )}
        </span>
        <span className="small text-muted">{progress}% complete</span>
      </div>
      <div className="progress mb-4" style={{ height: 6 }}>
        <div
          className="progress-bar bg-primary"
          style={{ width: `${progress}%` }}
          role="progressbar"
        />
      </div>

      {isMcq ? (
        <McqCard
          card={card}
          selectedOption={mcqAnswers[currentIndex] ?? null}
          onSelect={handleMcqSelect}
        />
      ) : (
        <FlashcardCard card={card} flipped={flipped} onFlip={flip} />
      )}

      <div className="d-flex justify-content-center gap-3">
        <button
          className="btn btn-outline-secondary"
          onClick={prev}
          disabled={currentIndex === 0}
        >
          <FaArrowLeft className="me-1" /> Previous
        </button>

        {allDone ? (
          <button className="btn btn-success" onClick={restart}>
            <FaRedo className="me-1" /> Start Over
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={next}
            disabled={isMcq && mcqAnswers[currentIndex] === undefined}
          >
            {currentIndex === total - 1 ? 'Finish' : 'Next'}{' '}
            <FaArrowRight className="ms-1" />
          </button>
        )}
      </div>

      {allDone && (
        <div className="alert alert-success text-center mt-4">
          <h5 className="mb-2">Quiz Complete!</h5>
          {mcqCount > 0 && (
            <p className="mb-1">
              MCQ Score: <strong>{score.correct}</strong> / {score.total} correct
            </p>
          )}
          <p className="mb-0">
            You reviewed all {total} questions. Click "Start Over" to try again.
          </p>
        </div>
      )}
    </div>
  );
};

export default FlashcardQuiz;
