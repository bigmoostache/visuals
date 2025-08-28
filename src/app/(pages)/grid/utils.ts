import { v4 as uuidv4 } from 'uuid';
import { Grid, GridSection, NotationCriteria, PossibleValue, GridValidationError } from './types';

export const generateId = (): string => uuidv4();

export const createNewPossibleValue = (value: number, definition: string): PossibleValue => ({
  id: generateId(),
  value,
  definition,
});

export const createNewCriteria = (): NotationCriteria => ({
  id: generateId(),
  name: '',
  definition: '',
  possible_values: [],
});

export const createNewSection = (): GridSection => ({
  id: generateId(),
  name: '',
  rows: [],
});

export const validatePossibleValue = (
  value: number | null,
  definition: string,
  existingValues: PossibleValue[]
): GridValidationError | null => {
  if (value === null) {
    return { field: 'value', message: 'Value is required' };
  }
  
  if (value < 0 || value > 100) {
    return { field: 'value', message: 'Value must be between 0 and 100' };
  }
  
  if (!definition.trim()) {
    return { field: 'definition', message: 'Definition is required' };
  }
  
  if (existingValues.some(v => v.value === value)) {
    return { field: 'value', message: 'This value already exists' };
  }
  
  return null;
};

export const validateSectionName = (name: string): GridValidationError | null => {
  if (name.length > 100) {
    return { field: 'name', message: 'Section name must be less than 100 characters' };
  }
  
  if (!/^[\w\s]*$/.test(name)) {
    return { field: 'name', message: 'Section name can only contain letters, numbers, and spaces' };
  }
  
  return null;
};

export const validateCriteriaName = (name: string): GridValidationError | null => {
  if (name.length > 200) {
    return { field: 'name', message: 'Criteria name must be less than 200 characters' };
  }
  
  return null;
};

// Ensure backward compatibility by adding IDs to existing data
export const ensureIds = (grid: any): Grid => {
  return {
    ...grid,
    rows: grid.rows.map((section: any) => ({
      ...section,
      id: section.id || generateId(),
      rows: section.rows.map((criteria: any) => ({
        ...criteria,
        id: criteria.id || generateId(),
        possible_values: criteria.possible_values.map((value: any) => ({
          ...value,
          id: value.id || generateId(),
        })),
      })),
    })),
  };
};

// Remove IDs before saving to maintain backward compatibility
export const removeIds = (grid: Grid): any => {
  return {
    ...grid,
    rows: grid.rows.map(section => ({
      name: section.name,
      rows: section.rows.map(criteria => ({
        name: criteria.name,
        definition: criteria.definition,
        possible_values: criteria.possible_values.map(value => ({
          value: value.value,
          definition: value.definition,
        })),
      })),
    })),
  };
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};