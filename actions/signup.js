//
// SIGNUP PROCEDURE
//
const the = require('../the');
const db = require('../inner_modules/database').current;
const UNI = require('../universe');

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

        if (!dat.name)
            return res.end(JSON.stringify({result: 0, type: 'warn', text: 'cmdr name is required'}));

        if (!dat.pass || dat.pass.length < 3)
            return res.end(JSON.stringify({result: 0, type: 'warn', text: 'password is required (atleast 3 chars)'}));
        if (dat.pass !== dat.pass_c)
            return res.end(JSON.stringify({result: 0, type: 'warn', text: 'password and confirmation are not equal'}));

        const exists_email = await db.cmrds.findOne({email: dat.email});
        if (exists_email !== null)
            return res.end(JSON.stringify({result: 0, type: 'warn', text: 'this email already used'}));

        const exists_cmdr = await db.cmrds.findOne({name: dat.name});
        if (exists_cmdr !== null){
            return res.end(JSON.stringify({result: 0, type: 'warn', text: 'this cmdr already registered'}));
        }

        let cmdr = {
            id: db.id('U'),
            name: dat.name,
            email: dat.email,
            pass: dat.pass,
            api_key: db.generate_api_key(),
            dev: false,
        };

        await db.cmrds.save(cmdr);

        res.end(JSON.stringify({result: 1, type: 'success', text: 'Your account ready!'}));

        UNI.get_cmdr({id: cmdr.id}).catch((e) => {});
    });
};



