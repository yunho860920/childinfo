import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSS와 clsx를 결합하여 조건부 클래스를 안전하게 병합하는 유틸리티 함수입니다.
 * @param  {...any} inputs 클래스 입력값들
 * @returns {string} 병합된 클래스 문자열
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
