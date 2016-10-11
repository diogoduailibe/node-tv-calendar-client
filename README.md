# node-tv-calendar-client
 
Node.js client for popular TV Shows Calendar [TV Calendar](http://www.pogdesign.co.uk/cat/).

## Install

```sh
$ npm install node-tv-calendar-client
```

## API

```js
var client = require('node-tv-calendar-client');
```

### searchSerieByName(serie,callback)

#### Parameters

- `serie` a piece or the fullname of the tv show. (required)
- `callback` a function that returns two parameters: `err` if there is an error or `list` if everything works fine. 
  
#### Example

```js
var client = require('node-tv-calendar-client');

client.searchSerieByName('the voice', (err, list) => {
    if (!err)
        console.log(list); //print all tv shows that has `the voice` as title content.
    else
        console.log(err);
});
```

### searchEpisodesByDate(date, callback)

#### Parameters

- `date` a date object that the episodes will be shown. (required)
- `callback` a function that returns two parameters: `err` if there is an error or `list` if everything works fine.

#### Example

```js
var client = require('node-tv-calendar-client');

client.searchEpisodesByDate(new Date(),(err,list) => {
    if (!err)
        console.log(list);//print all episodes that were or will be released today.
    else
        console.log(err);
});
```

### searchEpisodesBySeason(serie,season,callback)

#### Parameters

- `serie` a piece or the fullname of the tv show. (required)
- `season` a number that represents the season. (required)
- `callback` a function that returns two parameters: `err` if there is an error or `list` if everything works fine.

#### Example

```js
var client = require('node-tv-calendar-client');

client.searchEpisodesBySeason("The Flash",2, (err,list) => {
    if (!err)
        console.log(list); //print all episodes from The Flash's Season 2
    else
        console.log(err);
});
```

## License

MIT