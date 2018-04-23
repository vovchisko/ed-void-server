//
// SIGNUP PROCEDURE
//
const the = require('../the');
const db = require('../database').current;
const UNI = require('../universe');

module.exports = function (req, res) {
    the.handle_request(req, res, async (req, res, buffer) => {

        let dat = null;
        try {
            dat = JSON.parse(buffer.toString());
        } catch (e) { }

        if (!dat) return res.end(JSON.stringify({result: 0, type: 'fail', text: 'request was failed'}));
        if (!dat.email) return res.end(JSON.stringify({result: 0, type: 'warn', text: 'email is required'}));
        if (!dat.pass) return res.end(JSON.stringify({result: 0, type: 'warn', text: 'password is required'}));

        const user = await UNI.get_user({email: dat.email});

        if (!user) return res.end(JSON.stringify({result: 0, type: 'warn', text: 'invalid email or pass'}));
        if (user.pass !== db.hash(dat.pass)) return res.end(JSON.stringify({result: 0, type: 'warn', text: 'invalid email or pass'}))

        user.atoken = db.generate_token();
        await db.users.save(user);

        let jdata = {
            result: 1, type: 'success', user: {
                atoken: user.atoken, //todo: let's do different keys here
                name: user.cmdr,
                email: user.email
            }
        };
        res.end(JSON.stringify(jdata));
    });
};

