/// <reference types="react-scripts" />

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