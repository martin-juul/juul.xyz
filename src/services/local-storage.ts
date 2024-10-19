export class LocalStorage {
  constructor(public readonly lskPrefix: string) {}

  setBool(key: string, value: boolean) {
    if (value) {
      localStorage.setItem(this.makeKey(key), 'true');
    } else {
      localStorage.removeItem(this.makeKey(key));
    }
  }

  getBool(key: string) {
    return !!localStorage.getItem(this.makeKey(key));
  }

  setObject(key: string, value: object) {
      localStorage.setItem(this.makeKey(key), JSON.stringify(value));
  }

  getObject(key: string) {
    const storedItem = localStorage.getItem(this.makeKey(key));

    if (!storedItem) {
      return null;
    }

    return JSON.parse(storedItem);
  }

  setString(key: string, value: string) {
    localStorage.setItem(this.makeKey(key), value);
  }

  getString(key: string) {
    const storedItem = localStorage.getItem(this.makeKey(key));

    if (!storedItem) {
      return null;
    }

    return storedItem;;
  }

  hasItem(key: string) {
    return !!localStorage.getItem(this.makeKey(key));
  }

  removeItem(key: string) {
    localStorage.removeItem(this.makeKey(key));
  }

  clear() {
      localStorage.clear();
  }

  protected makeKey(key: string) {
    return `lsk[${this.lskPrefix}.${key}]`;
  }
}
