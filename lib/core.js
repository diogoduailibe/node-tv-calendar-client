/**
 * Created by diogo on 08/10/16.
 */

var cheerio = require('cheerio'),
    config = require('./config'),
    async = require('async'),
    util = require('./util'),
    iz = require('iz');

var TVCalendarClient = function TVCalendarClient() {

    this.searchSerieByName = (serie,callback) => {
        var options = {
            hostname: config.options.default.hostname,
            path: encodeURI(config.options.default.path + 'search-results.php?q=' + serie),
            method: config.options.default.method,
            headers: config.options.default.headers
        };

        var result = iz(serie,{required:'the value of the field \'serie\' is required'}).required();

        if (result.errors.length > 0)
            callback(result.errors.join(','));
        else {
            util.request(options, true, (data, error) => {
                if (error) callback(error);
                else {
                    try {
                        parseSearchSerieByName(data, callback);
                    } catch (ex) {
                        callback(ex)
                    }
                }
            });
        }
    };

    this.searchEpisodesByDate = (date, callback) => {
        var undef;

        var result = iz(date,
            {required:'the value of the field \'date\' is required',
             date:'the value of the field \'date\' must be a date'}).required().date();

        if (result.errors.length > 0)
            callback(result.errors.join(','));
        else {
            var dateStr = date.getDate() + '-' + (date.getMonth() + 1) + '-' + (date.getYear() + 1900);

            var options = {
                hostname: config.options.default.hostname,
                path: config.options.default.path + 'day/' + dateStr,
                method: config.options.default.method,
                headers: config.options.default.headers
            };

            util.request(options, true, (data, error) => {
                if (error) callback(error);
                else {
                    try {
                        var list = parseSearchEpisodesByDate(data);
                        callback(undef, list);
                    } catch (ex) {
                        callback(ex)
                    }
                }
            });
        }
    };

    this.searchEpisodesBySeason = (serie,season,callback) => {
        var undef,
            are = iz.are;

        var rules = {
            'serie': iz(serie, {required: 'the value of the field \'serie\' is required'}).required(),
            'season': iz(season, {required: 'the value of the field \'season\' is required',
                                    int: 'the value of the field \'season\' must be an integer'}).required().int()
        },areRules = are(rules);

        var result = Object.keys(areRules.getInvalidFields()).map(
            function(v) {
                return areRules.getInvalidFields()[v].join(',');
            });

        if (result.length > 0)
            callback(result);
        else {
            var serieStr = serie.replace(/[^0-9a-z\s]/gi, '').trim().replace(/\s/gi,'-') + '-summary';

            var options = {
                hostname: config.options.default.hostname,
                path: config.options.default.path + serieStr,
                method: config.options.default.method,
                headers: config.options.default.headers
            };

            util.request(options, true, (data, error) => {
                if (error) callback(error);
                else {
                    try {
                        var list = parseSearchEpisodesBySeason(data,season);
                        callback(undef, list);
                    } catch (ex) {
                        callback(ex)
                    }
                }
            });

        }

    };

    var parseSearchSerieByName = (data,callback) => {
        var $ = cheerio.load(data),
            list = [];

        $('a').each(function(item){
            var serie = {};
            serie.name = $(this).find('h1').text();
            serie.link = config.options.default.hostname + $(this).attr('href');
            list.push(serie);
        });

        return getSummary(list,callback);
    };

    var getSummary = (list,callback) => {
        async.mapSeries(list, function(item,cb){
            var idx = item.link.indexOf('/'),
                undef,
                path = item.link.slice(idx),
                options = {
                    hostname: config.options.default.hostname,
                    path: encodeURI(path),
                    method: config.options.default.method,
                    headers: config.options.default.headers
                };

            util.request(options, true, (data, error) => {
                if (!error){
                    var $ = cheerio.load(data);

                    item.summary = $('.sumtext').text();

                    $('li.hafdata').each(function (idx){
                        if (idx == 1){
                            item.episodes = $(this).find('span').text();
                        }
                        else if (idx == 2){
                            item.seasons = $(this).find('span').text();
                        }
                    });
                }
                else{
                    item.summary = 'No info.';
                    item.seasons = 'No info.';
                    item.episodes = 'No info.';
                }

                cb(undef,item);

            });

        },function(err,results){
            callback(err,results);
        });
    };

    var parseSearchEpisodesByDate = (data) => {

        var $ = cheerio.load(data),
            list = [];

        $('div.overbox').each(function(item){
            var serie = $(this).find('h4 > a').text(),
                season_episode_str = $(this).find('h4 > span').text(),
                split = season_episode_str.split(','),
                season = parseInt(split[0].trim().split(' ')[1],10),
                episode = parseInt(split[1].trim().split(' ')[1],10),
                episode_name = $(this).find('div.showepname > h5 > a').text().trim(),
                season_episode = 's' + (season < 10?'0'+season:season) + 'e' + (episode < 10?'0'+episode:episode),
                summary = $(this).find('div.summ').text().trim();

            list.push({
                'serie': serie,
                'season': season,
                'episode': episode,
                'season_episode': season_episode,
                'episode_name': episode_name,
                'summary':summary
            });

        });

        return list;
    }

    var parseSearchEpisodesBySeason = (data,season) => {

        var $ = cheerio.load(data),
            list = [];

        var principal = $('a[name=\"'+season+'\"]').parent();

        $(principal).find('li.ep').each(function(item){
            var season = $(this).find('span[itemprop=\"seasonNumber\"]').text();
            var episode = $(this).find('span.pnumber').attr('content');
            var episode_name = $(this).find('strong[itemprop=\"name\"] > a').text();
            var date = $(this).find('span.datepub').attr('content');
            list.push({
                season:season,
                episode:episode,
                season_episode:'s' + (season < 10?'0'+season:season) + 'e' + (episode < 10?'0'+episode:episode),
                episode_name:episode_name,
                date:date
            })
        });

        return list;
    }

};

module.exports = new TVCalendarClient();