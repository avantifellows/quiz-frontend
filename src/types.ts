// contains all the custom types that we want to use

type questionType = "mcq" | "checkbox" | "subjective";

export interface Question {
  type: questionType;
  options: string[];
  correct_answer: number | number[] | null;
  image: string | null;
  has_char_limit: boolean;
  max_char_limit: number | null;
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
