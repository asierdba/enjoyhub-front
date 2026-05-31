import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordMatchValidator(
  passwordField: string,
  confirmField: string,
): (control: AbstractControl) => ValidationErrors | null {

  return (control) => {
    const pass = control.get(passwordField)?.value;
    const confirm = control.get(confirmField)?.value;
    return pass && confirm && pass !== confirm ? { passwordMismatch: true } : null;
  };
}
