import BaseEntity from '../entities/base-entity';

export function validateRequiredFields(
  clazz: BaseEntity,
  requestBody: { [key: string]: string }
): string {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const requiredFields: string[] = (clazz as any).getRequiredFields();
  if (!Object.keys(requestBody).length) return requiredFields.join(', ');
  return requiredFields.filter((field) => !requestBody[field]).join(', ');
}
