export const DZ_PHONE_RE = /^(05|06|07)\d{8}$/;

export function isValidDzPhone(value: string): boolean {
  return DZ_PHONE_RE.test(value.trim());
}

export const PHONE_ERROR_MESSAGE = 'رقم الهاتف غير صحيح: يجب أن يبدأ بـ 05 أو 06 أو 07 ويتكوّن من 10 أرقام';