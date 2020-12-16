// lifted from https://lastfm.ghan.nl/export/

const API_KEY = process.env.REACT_APP_LASTFM_API_KEY;
console.log(API_KEY)

const axios = require('axios');
const retryInterceptor = require('axios-retry-interceptor');
const FileSaver = require('file-saver');


const lfm = axios.create({
        baseURL: 'https://ws.audioscrobbler.com/2.0',
        method: 'get',
      }),
      lfmRetry = axios.create({
        baseURL: 'https://ws.audioscrobbler.com/2.0',
        method: 'get',
      });

const typeData = {
  scrobbles: {
    key: 'scrobbles',
    label: 'Scrobbles',
    method: 'user.getRecentTracks',
    rootItem: 'recenttracks'
  },
  loves: {
    key: 'loves',
    label: 'Loved tracks',
    method: 'user.getLovedTracks',
    rootItem: 'lovedtracks'
  }
};

retryInterceptor(lfmRetry, {
  maxAttempts: 5,
  waitTime: 5000,
  errorCodes: [404, 500, 501, 502, 503, 504],
  onRetry: function(error){
    console.warn("Performing retry " + error.config.__retryCount);
  }
});

async function getPage(username, page, cb, lfm){
  console.log("get page" + page)
  const ret = await lfm.get('/', {
    params: {
      api_key: API_KEY,
      format: 'json',
      method: 'user.getRecentTracks',
      limit: 200,
      user: username,
      page: page
    }
  });

  const res = ret.data['recenttracks'],
        pages = res['@attr'].totalPages;

  if (cb) cb(page, pages);
  return res;
}

export async function getAllPages(username, cb){
  console.log(cb)
  // debugger
  try{
    const res = await getPage(username, 1, cb, lfm),
          pages = res['@attr'].totalPages,
          promises = [res];

    for (var i=2;i<=pages;i++){
      promises.push(getPage(username, i, cb, lfmRetry));
    }

    return Promise.all(promises);

  } catch(e) {
    console.log(e);
  }

}


export function cleanData(data){
  // var lines = [["uts", "utc_time", "artist", "album", "track",].join(",") + "\r\n"];
  
  var all_tracks = [];
  data.forEach(function(tracks){
    tracks.track.forEach(function(track){
      if (track.date){
        all_tracks.push({
          'date': new Date(track.date.uts*1000),
          'artist': track.artist['#text'],
          'album': track.album['#text'],
          'track': track.name
        })
      }
    });
  });
  return(all_tracks);
}


function saveData(data, form, fn) {

  if (form.format == "CSV"){
    var lines = [["uts", "utc_time", "artist", "artist_mbid", "album", "album_mbid", "track", "track_mbid"].join(",") + "\r\n"];
    data.forEach(function(tracks){
      tracks.track.forEach(function(track){
        if (track.date){
          lines.push([
            csv(track.date.uts),
            csv(track.date['#text']),
            csv(form.type=="scrobbles"?track.artist['#text']:track.artist.name),
            csv(track.artist.mbid),
            csv(form.type=="scrobbles"?track.album['#text']:""),
            csv(form.type=="scrobbles"?track.album.mbid:""),
            csv(track.name),
            csv(track.mbid)
          ].join(",") + "\r\n");
        }
      });
    });
    const csvblob = new Blob(lines, {type: "text/csv"});
    return FileSaver.saveAs(csvblob, fn + ".csv");
  }


  if (form.format == "JSON") {
    const blob = new Blob([JSON.stringify(data)], {type: "application/json"});
    return FileSaver.saveAs(blob, fn + ".json");
  }

}

function csv(val){
  if (val)
    return "\"" + (val).toString().replace(/"/g, "\"\"") + "\"";
  else
    return "\"\"";
}