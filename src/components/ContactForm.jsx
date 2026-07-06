'use client';

import { useState } from 'react';
import { useToast } from './ClientEffects';

export default function ContactForm() {
  const toast = useToast();
  const [errs, setErrs] = useState({});

  function submit(e) {
    e.preventDefault();
    const f = e.target;
    const next = {};
    if (!f.name.value.trim()) next.name = 'Please enter your name.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.value)) next.email = 'Enter a valid email.';
    if (!f.message.value.trim()) next.message = 'Please enter a message.';
    setErrs(next);
    if (Object.keys(next).length === 0) {
      toast('Message sent', "We'll get back to you soon.");
      f.reset();
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" />
        {errs.name && <span className="err">{errs.name}</span>}
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" />
        {errs.email && <span className="err">{errs.email}</span>}
      </div>
      <div className="field">
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" rows="5" />
        {errs.message && <span className="err">{errs.message}</span>}
      </div>
      <button className="btn btn-primary" type="submit">Send Message</button>
    </form>
  );
}
