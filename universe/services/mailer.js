const nodemailer = require('nodemailer');


class MailService {
    constructor(cfg) {
        this.transporter = nodemailer.createTransport(cfg);
    }

    send_email_confirmation(email, code) {
        this.transporter.sendMail({
            from: 'ED-VOID Account Service <ed.void.dev@gmail.com>',
            to: email,
            subject: 'Welcome to ED-VOID',
            html: `<h2>validate you account</h2><p>bla-bla-bla</p>`
        }).then((info) => {
            console.log(`EMAIL SENT: [email_confirmation] ${email} / ${code}`);
            console.log(' - response: ' + info.response);
            return true;
        }).catch((err) => {
            console.log(err);
        });
    }
}

module.exports = MailService;