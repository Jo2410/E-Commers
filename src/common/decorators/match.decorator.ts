import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Types } from 'mongoose';

@ValidatorConstraint({ name: 'match_between_fields', async: false })
export class mongoDBIds implements ValidatorConstraintInterface {
  validate(ids: Types.ObjectId[], args: ValidationArguments) {
    for (const id of ids) {
      console.log({id})
      if (!Types.ObjectId.isValid(id)) {
        return false;
      }
    }
    return true;
  }
  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Invalid mongoDBId format`;
  }
}

@ValidatorConstraint({ name: 'match_between_fields', async: false })
export class matchBetweenFields<T = any>
  implements ValidatorConstraintInterface
{
  validate(value: T, args: ValidationArguments) {
    console.log({
      value,
      args,
      matchWith: args.constraints[0],
      matchWithValue: args.object[args.constraints[0]],
    });

    return value === args.object[args.constraints[0]];
  }
  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Fail to match src field :: ${validationArguments?.property}  with target field :: ${validationArguments?.constraints[0]}`;
  }
}

export function IsMatch<T = any>(
  constraints: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints,
      validator: matchBetweenFields<T>,
    });
  };
}
