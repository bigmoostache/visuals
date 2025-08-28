export interface PossibleValue {
  id: string;
  value: number;
  definition: string;
}

export interface NotationCriteria {
  id: string;
  name: string;
  definition: string;
  possible_values: PossibleValue[];
}

export interface GridSection {
  id: string;
  name: string;
  rows: NotationCriteria[];
}

export interface Grid {
  context?: string;
  rows: GridSection[];
}

export interface GridValidationError {
  field: string;
  message: string;
}

export const CONSTANTS = {
  MIN_VALUE: 0,
  MAX_VALUE: 100,
  MIN_TEXTAREA_HEIGHT: 80,
  DEBOUNCE_DELAY: 500,
  AUTOSAVE_DELAY: 3000,
  MAX_SECTION_NAME_LENGTH: 100,
  MAX_CRITERIA_NAME_LENGTH: 200,
} as const;