import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private titleSvc = inject(Title);
  private meta     = inject(Meta);

  set(title: string, description: string, url?: string) {
    this.titleSvc.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    if (url) this.meta.updateTag({ property: 'og:url', content: `https://supportconnecte.com${url}` });
  }
}
