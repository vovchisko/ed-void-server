//
// SIGNUP PROCEDURE
//

const server = require('../../server');
const UNI = server.UNI;
const DB = server.DB;

module.exports = function (req, res) {
    server.handle_request(req, res, async (req, res, buffer) => {

        let dat = server.parse_json(buffer.toString());

        if (!dat) return res.end(JSON.stringify({result: 0, type: 'fail', text: 'request was failed'}));
        if (!dat.email) return res.end(JSON.stringify({result: 0, type: 'warn', text: 'email is required'}));
        if (!dat.pass) return res.end(JSON.stringify({result: 0, type: 'warn', text: 'password is required'}));

        const user = await UNI.get_user({email: dat.email});

        if (!user) return res.end(JSON.stringify({result: 0, type: 'warn', text: 'invalid email or pass'}));
        if (user.pass !== DB.hash(dat.pass)) return res.end(JSON.stringify({
            result: 0,
            type: 'warn',
            text: 'invalid email or pass'
        }));

        if (!user.wtoken) {
            user.wtoken = DB.generate_token();
            await DB.users.save(user);
        }

        let jdata = {
            result: 1, type: 'success', user: {
                wtoken: user.wtoken,
                api_key: user.api_key,
                name: user.cmdr_name,
                email: user.email
            }
        };
        res.end(JSON.stringify(jdata));
    });
};

