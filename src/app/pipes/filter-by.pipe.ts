import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterBy' })
export class FilterByPipe implements PipeTransform {
  transform(items: any[], search: string, keys: string[] = []): any[] {
    if (!items) return [];
    if (!search) return items;
    const s = search.toLowerCase();
    return items.filter((it) =>
      keys.some((k) => ('' + (it[k] || '')).toLowerCase().includes(s))
    );
  }
}
