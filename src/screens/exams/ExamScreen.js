// Обёртка над QuizScreen для экзаменов.
//
// Если у экзамена есть `pool` и `pickCount` — каждый монтаж экрана отбирает
// случайные `pickCount` вопросов. Без мутации модульного объекта quizzes
// (вопросы и заголовок передаются в QuizScreen через route.params).

import React, { useMemo, useRef } from 'react';
import { getExam } from '../../data/exams';
import QuizScreen from '../tests/QuizScreen';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestions(exam) {
  if (Array.isArray(exam.pool) && exam.pool.length > 0) {
    const pick = Math.min(exam.pickCount || 12, exam.pool.length);
    return shuffle(exam.pool).slice(0, pick);
  }
  return exam.questions || [];
}

export default function ExamScreen({ route, navigation }) {
  const examId = route.params.examId;
  const exam = getExam(examId);
  const attemptKeyRef = useRef(route.params.attemptKey || Date.now());

  const selectedQuestions = useMemo(() => {
    if (!exam) return [];
    return pickQuestions(exam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, attemptKeyRef.current]);

  // Уникальный ID попытки — для записи прогресса в стор. Не используется
  // для хранения вопросов: вопросы передаём прямо через route.
  const quizId = useMemo(() => `exam_${examId}_${attemptKeyRef.current}`, [examId]);

  const newRoute = useMemo(
    () => ({
      ...route,
      params: {
        ...route.params,
        quizId,
        quizTitle: exam?.title || '',
        inlineQuestions: selectedQuestions, // вопросы напрямую — QuizScreen прочитает их
        returnTo: 'Exams',
        examId,
        examHasPool: !!exam?.pool,
      },
    }),
    [route, quizId, exam, examId, selectedQuestions]
  );

  if (!exam) return null;
  return <QuizScreen route={newRoute} navigation={navigation} />;
}
