import { api } from "./api";

// Тип
export interface ExerciseBlank {
  id: number;
  blank_key: string;
  correct_answer: string;
  position: number;
  choices: string[] | null;
}

export interface Exercise {
  id: number;
  title: string;
  text: string;
  level: string;
  exercise_type: string;
  blanks: ExerciseBlank[];
}

export interface SubmitResult {
  score: number;
  details: {
    blank_key: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
  }[];
  xp_gained?: number;
  achievements_unlocked?: Array<{
    code: string;
    name: string;
    description?: string;
    unlocked_at?: string;
  }>;
  new_xp?: number;
}

// Список (с фильтром level)
export async function fetchExercises(level?: string): Promise<Exercise[]> {
  let url = "/api/exercises/exercises/";
  if (level) {
    url += `?level=${encodeURIComponent(level)}`;
  }
  const res = await api.get<Exercise[]>(url);
  return res.data;
}

// Получить конкретное упражнение
export async function fetchExerciseById(id: number): Promise<Exercise> {
  const res = await api.get<Exercise>(`/api/exercises/exercises/${id}/`);
  return res.data;
}

// Отправить ответы
export async function submitExerciseAnswers(
  exerciseId: number,
  answers: Record<string, string>
): Promise<SubmitResult> {
  // POST /api/exercises/<id>/submit/
  const res = await api.post<SubmitResult>(`/api/exercises/${exerciseId}/submit/`, {
    answers
  });
  return res.data;
}
