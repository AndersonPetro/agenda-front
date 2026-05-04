import {AbstractControl, FormArray, ValidatorFn} from '@angular/forms';

export function minArrayLength(min: number): ValidatorFn {
    return (control: AbstractControl) => {
        const array = control as FormArray;
        return array.length >= min ? null : { minArrayLength: { minLength: min } };
    };
}
