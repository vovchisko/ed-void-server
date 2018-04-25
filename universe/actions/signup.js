//
// SIGNUP PROCEDURE
//
const the = require('../the');
const db = require('../database').current;

module.exports = function (req, res) {
    the.handle_request(req, res, async (req, res, buffer) => {

        let dat = null;
        try {
            dat = JSON.parse(buffer.toString());
        } catch (e) {
        }

        if (!dat) res.end(JSON.stringify({result: 0, type: 'fail', text: 'request was failed'}));

        if (!dat.email)
            return res.end(JSON.stringify({result: 0, type: 'warn', text: 'email is required'}));

        if (!dat.pass || dat.pass.length < 3)
            return res.end(JSON.stringify({result: 0, type: 'warn', text: 'password is required (atleast 3 chars)'}));
        if (dat.pass !== dat.pass_c)
            return res.end(JSON.stringify({result: 0, type: 'warn', text: 'password and confirmation are not equal'}));

        const exists_email = await db.users.findOne({email: dat.email});
        if (exists_email !== null)
            return res.end(JSON.stringify({result: 0, type: 'warn', text: 'this email already used'}));

        let user = {
            _id: db.gen_id(),
            email: dat.email,
            pass: db.hash(dat.pass),
            api_key: db.generate_api_key(),
            atoken: db.generate_token(),
            dev: false,
            cmdrs: [],
            lng: '',
            gv: ''
        };

        await db.users.save(user);

        res.end(JSON.stringify({result: 1, type: 'success', text: 'Your account ready!'}));

    });
};



