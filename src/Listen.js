import React, {Component} from 'react';
import './App.css';
import axios from 'axios';
import {Table} from 'react-bootstrap';
import moment from 'moment';
import _ from 'lodash';

const OAuth = window.OAuth;
const url = 'https://api.spotify.com/v1/';
class Listen extends Component {
  constructor(props) {
    super(props);
    this.state = {artistsConcerts: []};
    this.store = {};
  }
  getPlaylists = () => {
    return this.ax({
      method: 'get',
      url: `${url}users/${this.spotifyUserId}/playlists`,
      limit: 50,
    });
  };

  componentDidMount() {
    if (_.isNil(OAuth)) {
      this.context.router.push('/');
    }
    OAuth.initialize('hPtKTa_GQdn9yfGJA4GYZzakU5s');

    OAuth.callback('spotify', {cache: true}).done(spotify => {
      this.accessToken = spotify.access_token;

      this.ax = axios.create({
        headers: {Authorization: 'Bearer ' + this.accessToken},
      });

      spotify.me().done(data => {
        this.spotifyUserId = data.id;

        let playlist = new Date().toLocaleDateString();
        this.playlist = `MC-${playlist}`;
        this.getPlaylists().then(res => {
          const playlist = res.data.items.filter(playlist => {
            return playlist.name === this.playlist;
          })[0];
          if (playlist) {
            let uri = 'https://open.spotify.com/embed?uri=' + playlist.uri;
            const iframe = document.querySelector('.player');
            iframe.src = uri;
            artistsPlayingConcerts().then(artists => {
              this.setState({artistsConcerts: artists.slice(0, 30)});
            });
            return;
          }

          this.ax({
            method: 'post',
            url: `${url}users/${this.spotifyUserId}/playlists`,
            data: {name: this.playlist},
          }).then(r => {
            const playListId = r.data.id;
            let uri = 'https://open.spotify.com/embed?uri=' + r.data.uri; //external_urls.spotify.replace('http', 'https')
            artistsPlayingConcerts().then(artists => {
              // console.log('ARTISTS', artists);

              this.setState({artistsConcerts: artists.slice(0, 30)});
              Promise.all(
                artists.map(({artistName, concert}) => {
                  const url = `https://api.spotify.com/v1/search?q=${artistName}&type=artist`;
                  return spotify.get(url).done(res => {
                    if (res.artists.items.length <= 0) {
                      return '';
                    }
                    const artistId = res.artists.items[0].id;
                    return this.ax({
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
                      return this.ax({
                        method: 'post',
                        url: `https://api.spotify.com/v1/users/${this.spotifyUserId}/playlists/${playListId}/tracks`,
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
    });
    function observeArtistPlaying() {
      MutationObserver = window.MutationObserver ||
        window.WebKitMutationObserver;

      var observer = new MutationObserver(function(mutations, observer) {
        // fired when a mutation occurs
        // console.log('utantts', mutations, observer);

        const player = document.querySelector('.player');
        var innerDoc = player.contentDocument || player.contentWindow.document;
        // console.log('INNERDOC', innerDoc);
        // get artist playing
        const artists = innerDoc.querySelector('body');
        // console.log('ARTISTS', artists);
      });

      // define what element should be observed by the observer
      // and what types of mutations trigger the callback
      const player = document.querySelector('iframe');
      observer.observe(player, {
        subtree: true,
        attributes: true,
        childList: true,
        characterData: true,
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

          <table>
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
          </table>
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

Listen.contextTypes = {
  router: React.PropTypes.object,
};
export default Listen;
