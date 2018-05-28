//
// SIGNUP PROCEDURE
//

const server = require('../../server');
const UNI = server.UNI;
const DB = server.DB;

module.exports = function (req, res) {
    server.handle_request(req, res, async (req, res, buffer) => {

        let dat = server.parse_json(buffer.toString());

        if (!dat) return res.end(JSON.stringify({result: 0, type: 'error', text: 'request was failed'}));
        if (!dat.email) return res.end(JSON.stringify({result: 0, type: 'error', text: 'email is required'}));
        if (!dat.pass) return res.end(JSON.stringify({result: 0, type: 'error', text: 'password is required'}));

        dat.email = dat.email.toLowerCase();

        const user = await UNI.get_user({email: dat.email});

        if (!user) return res.end(JSON.stringify({result: 0, type: 'error', text: 'invalid email or password'}));
        if (user.pass !== DB.hash(dat.pass)) return res.end(JSON.stringify({
            result: 0,
            type: 'error',
            text: 'invalid email or password'
        }));

        if (!user.api_key) {
            user.api_key = DB.some_hash();
            await DB.users.save(user);
        }

        let jdata = {
            result: 1, type: 'info', user: {
                api_key: user.api_key,
                name: user.cmdr_name,
                email: user.email
            }
        };
        res.end(JSON.stringify(jdata));
    });
};

