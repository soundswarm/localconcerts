import React, {Component} from 'react';
import './App.css';
import axios from 'axios';
import {Table} from 'react-bootstrap';
import moment from 'moment';
const OAuth = window.OAuth;
class Listen extends Component {
  constructor(props) {
    super(props);
    this.state = {artistsConcerts: []};
    this.store = {};
  }
  componentDidMount() {
    const that = this;
    var url = 'https://api.spotify.com/v1/';
    OAuth.initialize('hPtKTa_GQdn9yfGJA4GYZzakU5s');
    OAuth.callback('spotify', {cache: true}).done(function(spotify) {
      console.log('res', spotify);
      var accessToken = spotify.access_token;

      const ax = axios.create({
        headers: {Authorization: 'Bearer ' + accessToken},
      });
      ax({
        method: 'get',
        url: url + 'browse/featured-playlists',
      }).then(r => console.log('acsx', r));

      spotify.me().done(function(data) {
        const spotifyUserId = data.id;

        let playlist = new Date().toLocaleDateString();
        playlist = `MC-${playlist}`;

        const u = `${url}users/${spotifyUserId}/playlists`;

        ax({
          method: 'post',
          url: u,
          data: {name: playlist},
        }).then(r => {
          const playListId = r.data.id;
          let uri = 'https://open.spotify.com/embed?uri=' + r.data.uri; //external_urls.spotify.replace('http', 'https')
          artistsPlayingConcerts().then(artists => {
            // console.log('ARTISTS', artists);
            artists = Array.from(
              artists.reduce(
                (mem, artist) => {
                  if (mem.i <= 30) {
                    mem.arts.push(artist);
                  }
                  mem.i++;
                  return mem;
                },
                {
                  i: 0,
                  arts: [],
                },
              ).arts,
            );

            that.setState({artistsConcerts: artists});
            Promise.all(
              artists.map(({artistName, concert}) => {
                const url = `https://api.spotify.com/v1/search?q=${artistName}&type=artist`;
                return spotify.get(url).done(res => {
                  if (res.artists.items.length <= 0) {
                    return '';
                  }
                  const artistId = res.artists.items[0].id;
                  return ax({
                    url: `https://api.spotify.com/v1/artists/${artistId}/top-tracks`,
                    method: 'get',
                    params: {country: 'US'},
                  }).then(res => {
                    const topTracksUris = res.data.tracks.map(
                      track => track.uri,
                    );
                    const topTwoTracksUris = [];
                    for (let i = 0; i < 1; i++) {
                      if (topTracksUris[i]) {
                        topTwoTracksUris.push(topTracksUris[i]);
                      }
                    }
                    // console.log('topTwoTracksUris', topTwoTracksUris);
                    return ax({
                      method: 'post',
                      url: `https://api.spotify.com/v1/users/${spotifyUserId}/playlists/${playListId}/tracks`,
                      data: {uris: topTwoTracksUris},
                    });
                  });
                });
              }),
            ).then(() => {
              const iframe = document.querySelector('.player');
              observeArtistPlaying();
              iframe.src = uri;
              console.log('URI', uri);
            });
          });
        });
      });
    });
    function observeArtistPlaying() {
      console.log('asdfsdf');
      MutationObserver = window.MutationObserver ||
        window.WebKitMutationObserver;

      var observer = new MutationObserver(function(mutations, observer) {
        // fired when a mutation occurs
        console.log('utantts', mutations, observer);

        const player = document.querySelector('.player');
        var innerDoc = player.contentDocument || player.contentWindow.document;
        console.log('INNERDOC', innerDoc);
        // get artist playing
        const artists = innerDoc.querySelector('body');
        console.log('ARTISTS', artists);
      });

      // define what element should be observed by the observer
      // and what types of mutations trigger the callback
      const player = document.querySelector('iframe');
      observer.observe(player, {
        subtree: true,
        attributes: true,
        childList: true,
        characterData: true
      });
    }
    function artistsPlayingConcerts() {
      const sK = 'https://api.songkick.com/api/3.0/';
      const sKSearch = sK + 'search/locations.json';
      return axios({
        url: sKSearch,
        method: 'GET',
        params: {apikey: 'Z7OwHVINevycipT7', location: 'clientip'},
      }).then(function(res) {
        const locationId = res.data.resultsPage.results.location[
          0
        ].metroArea.id;
        const getConcerts = sK + `metro_areas/${locationId}/calendar.json?`;
        return axios({
          url: getConcerts,
          method: 'GET',
          params: {apikey: 'Z7OwHVINevycipT7'},
        }).then(function(res) {
          const concerts = res.data.resultsPage.results.event;
          const artists = [];

          concerts.forEach(concert => {
            concert.performance.forEach(artist => {
              const artistName = artist.artist.displayName;
              artists.push({artistName, concert});
            });
          });
          return artists;
        });
      });
    }
  }

  render() {
    return (
      <div className="app">
        <div className="title">
          LOCAL
          <div>
            CONCERTS
          </div>
        </div>

        <div className="concerts">

          <Table responsive>
            <tbody>
              {this.state.artistsConcerts.map(({artistName, concert}, i) => {
                return (
                  <tr
                    key={i}
                    className="concert"
                    onClick={() => window.open(concert.uri, '_blank')}
                  >
                    <td> {artistName} </td>
                    <td>
                      {moment(concert.start.date).format('MMM D')}
                    </td>
                    <td>{concert.venue.displayName}</td>

                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        <div className="subtitle">
          Click
          {' '}
          <span className="playText">PLAY</span>
          {' '}
          to listen to your Spotify playlist of these bands.
        </div>

        <div className="embed-container">
          <iframe
            title="spotifyplayer"
            className="player"
            src=""
            frameBorder="0"
            allowTransparency="true"
          />
        </div>

      </div>
    );
  }
}

export default Listen;
