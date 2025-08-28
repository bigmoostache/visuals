import { useEffect, useRef } from 'react';
import { CONSTANTS } from '../types';

export const useAutoResize = (value: string) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.max(scrollHeight, CONSTANTS.MIN_TEXTAREA_HEIGHT)}px`;
    }
  }, [value]);

  return textareaRef;
};