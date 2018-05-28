const nodemailer = require('nodemailer');


class MailService {
    constructor(cfg) {
        this.cfg = cfg;
        this.transporter = nodemailer.createTransport({
            service: this.cfg.service,
            auth: {
                user: this.cfg.auth.user,
                pass: this.cfg.auth.pass
            }
        });
    }

    send_everify(email, secret) {
        let link = `http://${this.cfg.domain}/app/#verify/${secret}`;

        this.transporter.sendMail({
            from: 'ED-VOID Account Service <ed.void.dev@gmail.com>',
            to: email,
            subject: 'Welcome to ED-VOID',
            html: `
<h3>WELCOME TO ED-VOID CMDR</h3>
<p>
    We're glad to see you in our ranks.<br>
    To verify your account use link below:<br><br>
    <a href="${link}" style="">${link}</a>
</p>
`
        }).then((info) => {
            console.log(`EMAIL SENT: [email_confirmation] ${email} / ${secret}`);
            console.log(' - response: ' + info.response);
            return true;
        }).catch((err) => {
            console.log(err);
        });
    }

    send_passrst(email, secret) {
        let link = `http://${this.cfg.domain}/app/#reset/${secret}`;

        this.transporter.sendMail({
            from: 'ED-VOID Account Service <ed.void.dev@gmail.com>',
            to: email,
            subject: 'Restore access to account',
            html: `
<h3>RESTORING ACCESS TO ACCOUNT</h3>
<p>
    Seems you have a trouble with login.<br>
    To reset your password use link below:<br><br>
    <a href="${link}">${link}</a>
</p>
`
        }).then((info) => {
            console.log(`EMAIL SENT: [email_confirmation] ${email} / ${secret}`);
            console.log(' - response: ' + info.response);
            return true;
        }).catch((err) => {
            console.log(err);
        });
    }
}

module.exports = MailService;