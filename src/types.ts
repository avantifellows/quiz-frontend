// contains all the custom types that we want to use
type language = "en" | "hi";
export type quizType = "assessment" | "homework";
export type quizTitleType = string | null;
export type textAreaValueType = string | number | null;
export type isFirstSessionType = boolean | null;
type quizNavigationMode = "linear" | "non-linear";
export type submittedAnswer = number[] | string | number | null;
type correctAnswer = number[] | number | null;

export enum eventType {
  START_QUIZ = "start-quiz",
  RESUME_QUIZ = "resume-quiz",
  END_QUIZ = "end-quiz"
}

export enum questionType {
  SINGLE_CHOICE = "single-choice",
  MULTI_CHOICE = "multi-choice",
  NUMERICAL_INTEGER = "numerical-integer",
  NUMERICAL_FLOAT = "numerical-float",
  SUBJECTIVE = "subjective"
}

export enum questionTypeHeaderText {
    SINGLE_CHOICE = "Single Choice",
    MULTI_CHOICE = "Multiple Choice",
    NUMERICAL_INTEGER = "Subjective Numerical",
    NUMERICAL_FLOAT = "Subjective Numerical",
 }

export interface IconButtonTitleConfig {
  value: string;
  class?: string | string[];
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

export type DraftResponse = number[] | number | string | null;

export interface SubmittedResponse {
  _id: string;
  question_id: string;
  answer: submittedAnswer;
  visited: boolean;
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

export interface TimeLimit {
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
  marking_scheme: MarkingScheme | null;
  solution: string[] | null;
  _id: string;
  metadata: QuestionMetadata | null;
}

interface QuestionSet {
  _id: string;
  questions: Question[];
}

export interface QuizAPIResponse {
  title: quizTitleType;
  instructions: string;
  _id: string;
  language: language;
  max_marks: number;
  metadata: QuizMetadata;
  navigation_mode: quizNavigationMode;
  num_attempts_allowed: number;
  num_graded_questions: number;
  shuffle: boolean;
  time_limit: TimeLimit | null;
  question_sets: QuestionSet[];
}

export interface SessionAPIResponse {
  _id: string;
  user_id: string;
  quiz_id: string;
  is_first: boolean;
  session_answers: SubmittedResponse[];
  has_quiz_ended: boolean;
  time_remaining?: number;
}

export interface UpdateSessionAPIPayload {
  event: eventType;
}
export interface UpdateSessionAPIResponse {
  time_remaining: number; // how much time is remaining for quiz to complete
}

export interface SessionAnswerAPIResponse {
  _id: string;
  session_id: string;
  question_id: string;
  answer: submittedAnswer;
  visited: boolean;
}

export interface UpdateSessionAnswerAPIPayload {
  answer?: submittedAnswer;
  visited?: boolean;
}

export interface answerEvaluation {
  valid: boolean; // whether the evaluation of the question is valid in the first place (invalid for ungraded questions)
  answered: boolean; // whether the question has been answered
  isCorrect?: boolean;
}

export type questionState = "success" | "error" | "neutral";
export interface paletteItemState {
  index: number; // index of the corresponding question in the list of questions
  value: questionState;
}

export interface OrganizationAPIResponse {
  _id: string;
  name: string;
}

export interface CircularProgressResult {
  title: string;
  value: string;
}

export interface JnvDict {
  [index : string] : string[];
}
