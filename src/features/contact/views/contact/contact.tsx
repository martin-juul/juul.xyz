import React, { useEffect } from 'react';
import './contact.css';
import { Socials } from '../../socials/socials';
import { FormattedMessage } from 'react-intl';

export function Contact() {

  useEffect(() => {
    const form = document.querySelector('.pageclip-form');
    // @ts-ignore
    window.Pageclip.form(form, {
      successTemplate: '👍',
    });
  }, []);

  return (
    <>
      <h1><FormattedMessage id="contact" /></h1>

      <Socials/>

      <p><FormattedMessage id="contact.page.get-in-touch" /></p>

      <form
        className="contact-form d-flex f-column pageclip-form"
        method="post"
        action="https://send.pageclip.co/XXb20PtxGWiDxWkp93Lvw20mXhmnIUpd/contact-form"
      >
        <div className="field-row">
          <label htmlFor="name"><FormattedMessage id="name"></FormattedMessage>:</label>
          <input
            type="text"
            id="name"
            name="name"
            autoComplete="off"
            data-1p-ignore
            required
          />
        </div>

        <div className="field-row">
          <label htmlFor="email"><FormattedMessage id="email"></FormattedMessage>:</label>
          <input
            type="email"
            id="email"
            name="email"
            maxLength={254}
            autoComplete="off"
            data-1p-ignore
            required
          />
        </div>

        <label htmlFor="message" className="block"><FormattedMessage id="message"></FormattedMessage></label>
        <textarea
          id="message"
          name="message"
          cols={40}
          rows={6}
          minLength={10}
          maxLength={5000}
          autoComplete="off"
          data-1p-ignore
          required
        ></textarea>

        <button
          type="submit"
          className="skew mt-2 pageclip-form__submit"
        >
          <span><FormattedMessage id="send"/></span>
        </button>
      </form>
    </>
  );
}