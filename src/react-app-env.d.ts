/// <reference types="react-scripts" />

global {
  interface Window {
    Pageclip: {
      form(form: HTMLFormElement, options?: {
        onSubmit?: (event) => boolean,
        onResponse?: (error, response) => void,
        successTemplate: string,
      });
    };
  }
}