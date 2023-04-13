import React, { useEffect, useState } from 'react';
import './contact.css';
import { Socials } from '../../socials/socials';
import { FormattedMessage, useIntl } from 'react-intl';
import { useModal } from '../../../../components/modal/use-modal';
import { Modal } from '../../../../components/modal/modal';
import { Helmet } from 'react-helmet-async';

export function Contact() {
  const [hasError, setHasError] = useState<boolean>(false);
  const {isOpen, toggle} = useModal();
  const intl = useIntl();

  useEffect(() => {
    const form = document.querySelector('.pageclip-form');
    if (!form) {
      console.error('could not find pageclip-form');
      return;
    }

    // @ts-ignore typings are not working that great as of now
    window.Pageclip.form(form, {
      onResponse: (error: unknown, _response: unknown) => {
        if (error) {
          toggle();
        }
      },
      successTemplate: '👍',
    });
  }, []);

  return (
    <>
      <Helmet prioritizeSeoTags>
        <title>{`${intl.formatMessage({ id: 'contact' })} | ${ intl.formatMessage({id: 'brand'}) }`}</title>
      </Helmet>

      <h1><FormattedMessage id="contact"/></h1>

      <Socials/>

      <p><FormattedMessage id="contact.page.get-in-touch"/></p>

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

      <button onClick={toggle}>Open modal</button>

      <Modal title={intl.formatMessage({id: 'error'})} isOpen={isOpen} toggle={toggle}>
        <p><FormattedMessage id="contact.page.unable-to-send-message" /></p>
      </Modal>
    </>
  );
}