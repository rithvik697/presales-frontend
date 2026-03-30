import { Pipe, PipeTransform } from '@angular/core';
import { parsePhoneNumberWithError, isValidPhoneNumber } from 'libphonenumber-js';

@Pipe({ name: 'phoneDisplay' })
export class PhoneDisplayPipe implements PipeTransform {
  private readonly knownCountryCodes = ['+91', '+1', '+44', '+61', '+86'];

  transform(value: string | null | undefined): string {
    if (!value) return '-';

    const raw = String(value).trim();

    try {
      // Numbers without + prefix: assume India and display with visible country code.
      const toParse = raw.startsWith('+') ? raw : `+91${raw.replace(/^0+/, '')}`;

      if (isValidPhoneNumber(toParse)) {
        const phone = parsePhoneNumberWithError(toParse);
        return phone.formatInternational();
      }
    } catch {}

    const matchedCode = [...this.knownCountryCodes]
      .sort((a, b) => b.length - a.length)
      .find((code) => raw.startsWith(code));

    if (matchedCode) {
      const localNumber = raw.slice(matchedCode.length).trim();
      return localNumber ? `${matchedCode} ${localNumber}` : matchedCode;
    }

    return raw;
  }
}
