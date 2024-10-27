import { Required } from '../../decorators/required.decorator';
import BaseEntity from '../../entities/base-entity';
import { validateRequiredFields } from '../../services/validation.service';

describe('validation services', () => {
  it('should return empty string if there are no required fields', () => {
    const requiredFields = validateRequiredFields(TestClassNoRequiredFields, {});
    expect(requiredFields).toEqual('');
  });

  it('should return string containing required fields if there are required fields', () => {
    const requiredFields = validateRequiredFields(TestClassRequiredFields, {});
    expect(requiredFields).toEqual('requiredValue1, requiredValue2');
  });

  it('should return string containing only unsupplied required fields', () => {
    const requiredFields = validateRequiredFields(TestClassRequiredFields, {
      requiredValue1: 'test-value',
    });
    expect(requiredFields).toEqual('requiredValue2');
  });
});

class TestClassNoRequiredFields extends BaseEntity {
  value1!: string;
  value2!: string;
}

class TestClassRequiredFields extends BaseEntity {
  @Required()
  requiredValue1!: string;

  @Required()
  requiredValue2!: string;
}
