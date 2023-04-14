/// <reference types="react-scripts" />

declare module '*.mp3';

global {
  interface Window {
    Pageclip: {
      form(form: HTMLFormElement, options?: {
        onSubmit?: (event: unknown) => boolean,
        onResponse?: (error: unknown, response: unknown) => void,
        successTemplate: string,
      });
    };
  }
}
