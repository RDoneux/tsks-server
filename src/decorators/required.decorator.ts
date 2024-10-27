// Decorator allowing the marking of a field as required
export function Required() {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  return function (target: any, propertyKey: string) {
    if (!target.constructor.requiredFields) {
      target.constructor.requiredFields = [];
    }
    target.constructor.requiredFields.push(propertyKey);
  };
}
