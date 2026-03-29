import { Pipe, PipeTransform } from '@angular/core';
import { parsePhoneNumberWithError, isValidPhoneNumber } from 'libphonenumber-js';

@Pipe({ name: 'phoneDisplay' })
export class PhoneDisplayPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '-';

    const raw = String(value).trim();

    try {
      // Numbers without + prefix: assume India
      const toParse = raw.startsWith('+') ? raw : `+91${raw.replace(/^0+/, '')}`;

      if (isValidPhoneNumber(toParse)) {
        const phone = parsePhoneNumberWithError(toParse);
        return phone.formatNational(); // e.g. "98765 43210" for India, "(555) 867-5309" for US
      }
    } catch {}

    return raw;
  }
}
