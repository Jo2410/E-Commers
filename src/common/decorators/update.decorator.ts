import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'match_between_fields', async: false })
export class CheckAnyFieldsAreApplied implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return (
      Object.keys(args.object).length > 0 &&
      Object.values(args.object).filter((arg) => {
        return arg != undefined;
      }).length>0
    );
    
  }
  defaultMessage(validationArguments?: ValidationArguments): string {
    return `All update fields are empty`;
  }
}

export function ContainField(validationOptions?: ValidationOptions) {
  return function (constructor: Function) {
    registerDecorator({
      target: constructor,
      propertyName: undefined!,
      options: validationOptions,
      constraints: [],
      validator: CheckAnyFieldsAreApplied,
    });
  };
}
