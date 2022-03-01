// contains all the types that we want to use

type itemType = "question";
type questionType = "mcq" | "checkbox" | "subjective";

export interface Question {
  type: questionType;
  options: string[];
  correct_answer: number | number[] | null;
  image: string | null;
  has_char_limit: boolean;
  max_char_limit: number | null;
}

export interface Item {
  type: itemType;
  details: Question;
}

export interface IconButtonTitleConfig {
  value: string;
  class: string;
}

export interface IconButtonIconConfig {
  enabled: boolean;
  iconName: string;
  iconClass: string;
}
