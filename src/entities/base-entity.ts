export default abstract class BaseEntity {
  // used by the required decorator to list required fields
  static getRequiredFields(): string[] {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    return (this as any).requiredFields || [];
  }
}
