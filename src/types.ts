// contains all the custom types that we want to use

type questionWithOptions = "mcq" | "checkbox";
type questionType = questionWithOptions | "subjective";

export interface Question {
  type: questionType;
  text: string;
  options: string[];
  correct_answer: number | number[] | null;
  image: string | null;
  max_char_limit: number | null;
  survey: boolean;
}

export interface IconButtonTitleConfig {
  value: string;
  class?: string;
}

export interface IconButtonIconConfig {
  enabled: boolean;
  iconName: string;
  iconClass?: string;
}

export interface InputTextValidationConfig {
  enabled: boolean;
  isValid: boolean;
  validMessage: String;
  invalidMessage: String;
}

export type DraftResponse = number[] | null;

export interface SubmittedResponse {
  answer: number[] | null;
}
