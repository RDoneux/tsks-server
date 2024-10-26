export default class BaseEntity {
  // used by the required decorator to list required fields
  static requiredFields: string[] = [];
  static getRequiredFields(): string[] {
    return this.requiredFields || [];
  }
}
