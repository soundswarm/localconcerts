import React, {Component} from 'react';
import './App.css';
const OAuth = window.OAuth;
class App extends Component {
  componentDidMount() {
    var url = 'https://api.spotify.com/v1/';
    OAuth.initialize('hPtKTa_GQdn9yfGJA4GYZzakU5s');
    OAuth.redirect('spotify', window.location.origin + '/listen');
  }
  render() {
    return <div>app</div>;
  }
  //   OAuth.popup('spotify').done(function(spotify, a) {
  //     // window.addEventListener('hashchange', router);
  //     // // Listen on page load:
  //     // window.addEventListener('load', router);
  //     console.log('href', document.location.href);
  //
  //     console.log('res', spotify, a);
  //     var accessToken = spotify.access_token;
  //
  //     const ax = axios.create({
  //       headers: {Authorization: 'Bearer ' + accessToken},
  //     });
  //     ax({
  //       method: 'get',
  //       url: url + 'browse/featured-playlists',
  //     }).then(r => console.log('acsx', r));
  //
  //     spotify.me().done(function(data) {
  //       const spotifyUserId = data.id;
  //
  //       const playlist = new Date().toLocaleDateString();
  //
  //       const u = `${url}users/${spotifyUserId}/playlists`;
  //
  //       ax({
  //         method: 'post',
  //         url: u,
  //         data: {name: playlist},
  //       }).then(r => {
  //         const playListId = r.data.id;
  //         let uri = 'https://open.spotify.com/embed?uri=' + r.data.uri; //external_urls.spotify.replace('http', 'https')
  //         console.log('re.data', r.data);
  //
  //         // uri = 'https://open.spotify.com/embed?uri=' + uri;
  //         ('spotify:user:symbioticshift:playlist:7cQr8P6M4TbkeflwfNzzAu');
  //         // const workuri = 'https://open.spotify.com/embed?uri=spotify:user:symbioticshift:playlist:3kPchRaFQmqCgrTRyugtGD';
  //         // console.log('URI', uri);
  //         // console.log('WORKURI', workuri);
  //         // console.log('re.d', r.data);
  //         //
  //         // const iframe = document.querySelector('.player');
  //         // console.log('ifrane', iframe);
  //         // iframe.src = uri;
  //         artistsPlayingConcerts().then(artists => {
  //           console.log('ARTISTS', artists);
  //           artists = Array.from(
  //             artists.reduce(
  //               (mem, artist) => {
  //                 if (mem.i <= 10) {
  //                   mem.arts.push(artist);
  //                 }
  //                 mem.i++;
  //                 return mem;
  //               },
  //               {
  //                 i: 0,
  //                 arts: [],
  //               },
  //             ).arts,
  //           );
  //           // console.log('ARTISTS.LENGTH', artists.length);
  //
  //           artists.forEach(artistName => {
  //             const url = `https://api.spotify.com/v1/search?q=${artistName}&type=artist`;
  //             spotify.get(url).done(res => {
  //               const artistId = res.artists.items[0].id;
  //               // console.log('spotify', res);
  //               ax({
  //                 url: `https://api.spotify.com/v1/artists/${artistId}/top-tracks`,
  //                 method: 'get',
  //                 params: {country: 'US'},
  //               }).then(res => {
  //                 const topTracksUris = res.data.tracks.map(track => track.uri);
  //                 const topTwoTracksUris = [];
  //                 for (let i = 0; i < 2; i++) {
  //                   if (topTracksUris[i]) {
  //                     topTwoTracksUris.push(topTracksUris[i]);
  //                   }
  //                 }
  //                 // console.log('topTwoTracksUris', topTwoTracksUris);
  //                 ax({
  //                   method: 'post',
  //                   url: `https://api.spotify.com/v1/users/${spotifyUserId}/playlists/${playListId}/tracks`,
  //                   data: {uris: topTwoTracksUris},
  //                 }).then(r => {
  //                   // uri="https://open.spotify.com/embed?uri="+uri
  //                   const workuri = 'https://open.spotify.com/embed?uri=spotify:user:symbioticshift:playlist:3kPchRaFQmqCgrTRyugtGD';
  //                   console.log('URI', uri);
  //                   console.log('WORKURI', workuri);
  //
  //                   const iframe = document.querySelector('.player');
  //                   console.log('ifrane', iframe);
  //                   iframe.src = uri;
  //                 });
  //               });
  //             });
  //           });
  //         });
  //       });
  //     });
  //   });
  //
  //   function artistsPlayingConcerts() {
  //     const sK = 'https://api.songkick.com/api/3.0/';
  //     const sKSearch = sK + 'search/locations.json';
  //     return axios({
  //       url: sKSearch,
  //       method: 'GET',
  //       params: {apikey: 'Z7OwHVINevycipT7', location: 'clientip'},
  //     }).then(function(res) {
  //       const locationId = res.data.resultsPage.results.location[
  //         0
  //       ].metroArea.id;
  //       const getConcerts = sK + `metro_areas/${locationId}/calendar.json?`;
  //       return axios({
  //         url: getConcerts,
  //         method: 'GET',
  //         params: {apikey: 'Z7OwHVINevycipT7'},
  //       }).then(function(res) {
  //         const concerts = res.data.resultsPage.results.event;
  //         const artists = [];
  //         concerts.forEach(concert => {
  //           concert.performance.forEach(artist => {
  //             const artistName = artist.artist.displayName;
  //             artists.push(artistName);
  //           });
  //         });
  //         return artists;
  //       });
  //     });
  //   }
  // }
  // render() {
  //   return (
  //     <div className="app">
  //       <div className="title">
  //         MUSIC
  //         <div>
  //           CODE
  //         </div>
  //       </div>
  //
  //       <div className="subtitle">
  //         Click
  //         {' '}
  //         <span className="playText">PLAY</span>
  //         {' '}
  //         to generate a Spotify playlist of bands with upcoming shows in your area.
  //       </div>
  //       <div className="embed-container">
  //         <iframe
  //           className="player"
  //           src=""
  //           frameBorder="0"
  //           allowTransparency="true"
  //         />
  //       </div>
  //     </div>
  //   );
  // }
}

export default App;
