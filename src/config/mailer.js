import nodemailer from 'nodemailer'; 
import sgTransport from 'nodemailer-sendgrid-transport'; 
export const mailer = () => nodemailer.createTransport(sgTransport({
  auth: {
    api_key: process.env.SENDGRID_API_KEY
  }
}));