//
// SIGNUP PROCEDURE
//

const server = require('../../server');
const DB = require('../database');

module.exports = function (req, res) {
    server.handle_request(req, res, async (req, res, buffer) => {

        let dat = server.parse_json(buffer.toString());

        if (!dat) res.end(JSON.stringify({result: 0, type: 'fail', text: 'request was failed'}));

        if (!dat.email)
            return res.end(JSON.stringify({result: 0, type: 'warn', text: 'email is required'}));

        if (!dat.pass || dat.pass.length < 3)
            return res.end(JSON.stringify({result: 0, type: 'warn', text: 'password is required (atleast 3 chars)'}));


        dat.email = dat.email.toLowerCase();

        const exists_email = await DB.users.findOne({email: dat.email});
        if (exists_email !== null)
            return res.end(JSON.stringify({result: 0, type: 'warn', text: 'this email already used'}));

        let user = {
            _id: DB.gen_id(),
            email: dat.email,
            pass: DB.hash(dat.pass),
            api_key: DB.generate_api_key(),
        };

        await DB.users.save(user);

        res.end(JSON.stringify({result: 1, type: 'success', text: 'Your account ready!'}));

    });
};



