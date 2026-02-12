import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterBy' })
export class FilterByPipe implements PipeTransform {
  transform(items: any[], search: string, keys: string[] = []): any[] {
    if (!items) return [];
    if (!search) return items;
    const s = search.toLowerCase();

    return items.filter((it) => {
      // If keys provided, use them; else check all object values
      if (keys && keys.length > 0) {
        return keys.some((k) => ('' + (it[k] || '')).toLowerCase().includes(s));
      } else {
        return Object.values(it).some((val) => ('' + (val || '')).toLowerCase().includes(s));
      }
    });
  }
}
