import nodemailer from 'nodemailer';
import { HTTPError } from '../../class/HTTPError';
import Mail from 'nodemailer/lib/mailer';

export type SendMailOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};
export const sendEmail = ({ to, subject, text, html }: SendMailOptions) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true, // true for port 465, false for other ports
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PW,
    },
  });

  const mailOptions: Mail.Options = {
    from: process.env.EMAIL_SENDER,
    to: to,
    subject: subject,
    text: text,
    html: html,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      throw new HTTPError('An error occurred while sending email', 500);
    } else {
      console.log('Email successfully sent: ', info.response);
    }
  });
};
