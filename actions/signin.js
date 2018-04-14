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
        } catch (e) { }

        if (!dat) return res.end(JSON.stringify({result: 0, type: 'fail', text: 'request was failed'}));
        if (!dat.email) return res.end(JSON.stringify({result: 0, type: 'warn', text: 'email is required'}));
        if (!dat.pass) return res.end(JSON.stringify({result: 0, type: 'warn', text: 'password is required'}));

        const cmdr = await UNI.get_cmdr({email: dat.email});

        if (!cmdr) return res.end(JSON.stringify({result: 0, type: 'warn', text: 'no cush user is here'}));
        if (cmdr.pass !== dat.pass) return res.end(JSON.stringify({result: 0, type: 'warn', text: 'invalid pass'}))

        if (!cmdr.atoken) {
            cmdr.atoken = db.generate_token();
            await db.cmrds.save(cmdr);
        }

        let jdata = {
            result: 1, type: 'success', cmdr: {
                atoken: cmdr.atoken, //todo: let's do different keys here
                name: cmdr.name,
                email: cmdr.email
            }
        };

        console.log(jdata)

        res.end(JSON.stringify(jdata));

    });
};



