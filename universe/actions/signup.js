//
// SIGNUP PROCEDURE
//
const server = require('../../server');

module.exports = function (req, res) {
    server.handle_request(req, res, async (req, res, buffer) => {

        let dat = server.parse_json(buffer.toString());

        if (!dat) res.end(JSON.stringify({result: 0, type: 'fail', text: 'request was failed'}));

        if (!dat.email)
            return res.end(JSON.stringify({result: 0, type: 'warn', text: 'email is required'}));

        // todo: 1 validate email here.

        if (!dat.pass || dat.pass.length < 3)
            return res.end(JSON.stringify({result: 0, type: 'warn', text: 'password is required (atleast 3 chars)'}));


        dat.email = dat.email.toLowerCase();

        const exists_email = await server.DB.users.findOne({email: dat.email});
        if (exists_email !== null)
            return res.end(JSON.stringify({result: 0, type: 'warn', text: 'this email already used'}));

        // todo: 2 generate validation code here.
        let user = {
            _id: server.DB.gen_id(),
            email: dat.email,
            pass: server.DB.hash(dat.pass),
            api_key: server.DB.generate_api_key(),
        };

        // todo: 3 send email here.
        // server.EML.send_email_confirmation(dat.email, 'SOME_CODE');

        // after it : validation page is simply page when user can type validation code, or pass it through URL hash

        await server.DB.users.save(user);

        res.end(JSON.stringify({result: 1, type: 'success', text: 'Your account ready!'}));

    });
};



