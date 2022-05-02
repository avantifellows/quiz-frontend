// contains all the custom types that we want to use

type questionWithOptions = "single-choice" | "multi-choice";
type questionType = questionWithOptions | "subjective";
type language = "en" | "hi";
export type quizType = "assessment" | "homework";
type quizNavigationMode = "linear" | "non-linear";
export type submittedAnswer = number[] | string | null;
type correctAnswer = number[] | null;

export interface IconButtonTitleConfig {
  value: string;
  class?: string;
}

export interface IconButtonIconConfig {
  enabled: boolean;
  iconName: string;
  iconClass?: string | string[];
}

export interface InputTextValidationConfig {
  enabled: boolean;
  isValid: boolean;
  validMessage: String;
  invalidMessage: String;
}

export type DraftResponse = number[] | string | null;

export interface SubmittedResponse {
  _id: string;
  question_id: string;
  answer: submittedAnswer;
}

interface ScorecardMetricIcon {
  source: string;
  class: string;
}

export interface ScorecardMetric {
  name: string;
  icon: ScorecardMetricIcon;
  value: number;
}

export interface QuizMetadata {
  quiz_type: quizType;
  grade: string;
  subject: string;
  chapter?: string;
  topic?: string;
}

interface QuestionMetadata {
  grade: string;
  subject: string;
  chapter: string;
  topic: string;
  competency: string[];
  difficulty: string;
}

interface TimeLimit {
  min: number;
  max: number;
}

interface Image {
  url: string;
  alt_text: string;
}

interface MarkingScheme {
  correct: number;
  wrong: number;
  skipped: number;
}

interface Option {
  text: string;
  image: Image | null;
}

export interface Question {
  type: questionType;
  text: string;
  options: Option[] | null;
  correct_answer: correctAnswer;
  image: Image | null;
  max_char_limit: number | null;
  graded: boolean;
  instructions: string | null;
  markingScheme: MarkingScheme | null;
  solution: string[] | null;
  _id: string;
  metadata: QuestionMetadata | null;
}

interface QuestionSet {
  _id: string;
  questions: Question[];
}

export interface QuizAPIResponse {
  instructions: string;
  _id: string;
  language: language;
  maxMarks: number;
  metadata: QuizMetadata;
  navigation_mode: quizNavigationMode;
  numAttemptsAllowed: number;
  numGradedQuestions: number;
  shuffle: boolean;
  timeLimit: TimeLimit | null;
  question_sets: QuestionSet[];
}

export interface SessionAPIResponse {
  _id: string;
  user_id: string;
  quiz_id: string;
  is_first: boolean;
  session_answers: SubmittedResponse[];
}

export interface SessionAnswerAPIResponse {
  _id: string;
  session_id: string;
  question_id: string;
  answer: submittedAnswer;
}
