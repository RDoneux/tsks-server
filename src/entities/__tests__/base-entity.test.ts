import BaseEntity from '../base-entity';

describe('Base Entity', () => {
  it('should return required fields list', () => {
    expect(BaseEntity.getRequiredFields()).toEqual([]);
    BaseEntity.requiredFields = ['fieldOne', 'fieldTwo'];
    expect(BaseEntity.getRequiredFields()).toEqual(['fieldOne', 'fieldTwo']);
  });
});
