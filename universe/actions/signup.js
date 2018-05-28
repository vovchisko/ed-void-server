//
// SIGNUP PROCEDURE
//
const server = require('../../server');

module.exports = function (req, res) {
    server.handle_request(req, res, async (req, res, buffer) => {

        let dat = server.parse_json(buffer.toString());

        if (!dat)
            return res.end(JSON.stringify({result: 0, type: 'error', text: 'request was failed'}));

        if (!dat.email)
            return res.end(JSON.stringify({result: 0, type: 'error', text: 'email is required'}));

        dat.email = dat.email.toLowerCase();

        if (!server.tools.is_valid_email(dat.email))
            return res.end(JSON.stringify({result: 0, type: 'error', text: 'email is invalid'}));

        if (!dat.pass || dat.pass.length < 5)
            return res.end(JSON.stringify({result: 0, type: 'error', text: 'password is required (atleast 5 symbols)'}));

        const exists_email = await server.DB.users.findOne({email: dat.email});
        if (exists_email !== null)
            return res.end(JSON.stringify({result: 0, type: 'error', text: 'this email already used'}));

        let user = {
            _id: server.DB.gen_id(),
            email: dat.email,
            pass: server.DB.hash(dat.pass),
            api_key: server.DB.some_hash(),
            secret: server.DB.some_hash(),
            valid: false,
        };

        await server.DB.users.save(user);

        await server.EML.send_everify(dat.email, user.secret);

        res.end(JSON.stringify({result: 1, type: 'info', text: 'Your account ready!'}));

    });
};



