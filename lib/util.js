/**
 * Created by diogo on 05/10/16.
 */
var http = require('http'),
    zlib = require('zlib'),
    https = require('https');

module.exports = {
    request: function request(options, ssl, callback) {
        var protocol = ssl ? https : http;
        var req = protocol.request(options, (res) => {

            var data = "",
                output;

            if (res.headers['content-encoding'] == 'gzip') {
                var gzip = zlib.createGunzip();
                res.pipe(gzip);
                output = gzip;
            } else if (res.headers['content-encoding'] == 'deflate') {
                var inflate = zlib.createInflate();
                res.pipe(inflate);
                output = inflate;
            }
            else {
                output = res;
            }

            output.on("data", (chunk) => {
                data += chunk;
            });

            output.on("end", (error) => {
                callback(data, error);
            });

        });

        req.end();
    },
    pad: function pad(n) {
        return (n < 10) ? ("0" + n) : n;
    }
};
