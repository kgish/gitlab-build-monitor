import { Injectable } from '@angular/core';

const ITEM_KEY = 'redirect-url';

@Injectable({
  providedIn: 'root'
})
export class RedirectUrlService {

  constructor() {
  }

  save(url: string) {
    localStorage.setItem(ITEM_KEY, url);
    // console.log(`RedirectUrlService save url='${url}'`);
  }

  get() {
    const url = localStorage.getItem(ITEM_KEY);
    localStorage.removeItem(ITEM_KEY);
    // console.log(`RedirectUrlService get() url='${url}'`);
    return url;
  }
}
