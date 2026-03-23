import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneDisplay'
})
export class PhoneDisplayPipe implements PipeTransform {
  private readonly knownCountryCodes = ['+91', '+1', '+44', '+61', '+86'];

  transform(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }

    const raw = String(value).trim();
    const matchedCode = [...this.knownCountryCodes]
      .sort((a, b) => b.length - a.length)
      .find((code) => raw.startsWith(code));

    if (!matchedCode) {
      return raw;
    }

    const localNumber = raw.slice(matchedCode.length).trim();
    return localNumber ? `${matchedCode} ${localNumber}` : matchedCode;
  }
}
