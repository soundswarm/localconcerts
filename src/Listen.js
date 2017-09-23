import React, {Component} from 'react';
import './App.css';
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
import ss from 'string-similarity';
import classnames from 'classnames';
import CurrentlyPlaying from './CurrentlyPlaying';

const OAuth = window.OAuth;
const userip = window.userip;
const url = 'https://api.spotify.com/v1/';
class Listen extends Component {
  constructor(props) {
    super(props);
    this.state = {artistsConcerts: [], currentlyPlaying: {}};
    this.ax = null;
    this.concertDate = null;
    this.q = [];
    this.iframeSrc = '';
  }
  getPlaylists = () => {
    return this.ax({
      method: 'get',
      url: `${url}users/${this.spotifyUserId}/playlists`,
      limit: 50,
    });
  };
  getCurrentSong = () => {
    return this.ax({
      method: 'get',
      url: `${url}me/player/currently-playing`,
    });
  };

  getCurrentSongAndDisplay = () => {
    this.getCurrentSong().then(res => {
      const spotifySong = res.data.item;
      console.log('SPOTIFYSONG', spotifySong);

      if (spotifySong && spotifySong.duration_ms) {
        setTimeout(this.getCurrentSongAndDisplay, 6000);
        const artistPlaying = spotifySong.artists[0].name;

        const newState = {...this.state};
        this.state.artistsConcerts.forEach((artist, i) => {
          console.log(
            '(artist.artistName, artistPlaying',
            artist.artistName,
            artistPlaying,
          );
          if (ss.compareTwoStrings(artist.artistName, artistPlaying) > 0.5) {
            console.log('trueee');
            newState.artistsConcerts[i].currentlyPlaying = true;
            newState.currentlyPlaying = newState.artistsConcerts[i];
          } else {
            console.log('falllse');

            newState.artistsConcerts[i].currentlyPlaying = null;
          }
        });
        // console.log('NEWSTATE', newState);
        this.setState(newState);
      }
    });
  };

  componentDidMount() {
    if (_.isNil(OAuth)) {
      this.props.history.push('/');
      return;
    }
    OAuth.initialize('hPtKTa_GQdn9yfGJA4GYZzakU5s');
    const oauthCallback = OAuth.callback('spotify', {cache: true});
    if (_.isNil(oauthCallback)) {
      this.props.history.push('/');
      return;
    }
    oauthCallback.done(spotify => {
      this.accessToken = spotify.access_token;

      this.ax = axios.create({
        headers: {Authorization: 'Bearer ' + this.accessToken},
      });

      spotify.me().done(data => {
        this.spotifyUserId = data.id;

        let playlist = moment(new Date()).add(1, 'days').format('l');
        this.playlist = `LC-${playlist}`;
        this.getPlaylists().then(res => {
          const playlist = res.data.items.filter(playlist => {
            return playlist.name === this.playlist;
          })[0];
          if (playlist) {
            let uri = 'https://open.spotify.com/embed?uri=' + playlist.uri;
            const iframe = document.querySelector('.player');
            // observeArtistPlaying();
            this.setState({iframeSrc: uri});
            this.getCurrentSongAndDisplay();
            // iframe.src = uri;
            artistsPlayingConcerts().then(artists => {
              console.log('ARTISTS', artists);
              const artistsConcerts = artists.slice(0, 40);
              this.setState({artistsConcerts});
              this.setState({
                concertDate: artistsConcerts[0].concert.start.date,
              });
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
                      return this.ax({
                        method: 'post',
                        url: `https://api.spotify.com/v1/users/${this.spotifyUserId}/playlists/${playListId}/tracks`,
                        data: {uris: topTwoTracksUris},
                      });
                    });
                  });
                }),
              ).then(() => {
                this.getCurrentSongAndDisplay();
                this.setState({iframeSrc: uri});
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

        const player = document.querySelector('.player');
        var innerDoc = player.contentDocument || player.contentWindow.document;
        // get artist playing
        // const artists = innerDoc.querySelector('body');
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
      console.log('ip()', userip);
      return axios({
        url: sKSearch,
        method: 'GET',
        params: {apikey: 'Z7OwHVINevycipT7', location: `ip:${userip}`},
      }).then(function(res) {
        const locationId = res.data.resultsPage.results.location[
          0
        ].metroArea.id;
        const getConcerts = sK + `metro_areas/${locationId}/calendar.json?`;
        // http://api.songkick.com/api/3.0/events.json?apikey={your_api_key}
        const searchEvents = 'http://api.songkick.com/api/3.0/events.json';
        let tomorrow = moment(new Date()).add(1, 'days');
        console.log('TOMORROW', tomorrow);
        return axios({
          url: searchEvents,
          method: 'GET',
          params: {
            apikey: 'Z7OwHVINevycipT7',
            location: `ip:${userip}`,
            min_date: tomorrow.format('YYYY-MM-DD'),
            max_date: tomorrow.format('YYYY-MM-DD'),
          },
        }).then(function(res) {
          const concerts = res.data.resultsPage.results.event;
          console.log('CONCERTS', concerts);
          const artists = [];

          concerts.forEach(concert => {
            concert.performance.forEach(artist => {
              // console.log('ARTIST', artist);
              const artistName = artist.artist.displayName;

              console.log(
                'tomorrow',
                tomorrow,
                moment(concert.start.date).format('l'),
              );
              console.log('ARTISTNAME, CONCERT', artistName, concert);
              if (
                moment(concert.start.date).format('l') === tomorrow.format('l')
              ) {
                artists.push({artistName, concert});
              }
            });
          });
          return artists;
        });
      });
    }
  }

  render() {
    const displayedVenues = {};
    return (
      <div className="app">
        <div className="title">
          LOCAL
          <div>
            CONCERTS
          </div>
          <div>
            {this.state.concertDate
              ? moment(this.state.concertDate).format('ddd MMM D')
              : null}
          </div>
        </div>
        <CurrentlyPlaying
          iframeSrc={this.state.iframeSrc}
          {...this.state.currentlyPlaying}
        />
        <div className="concerts">

          <table>
            <tbody>
              {this.state.artistsConcerts.map(({
                artistName,
                concert,
                currentlyPlaying,
              }, i) => {
                const concertClasses = classnames({
                  concert: true,
                  currentlyPlaying,
                });
                const existing = {...displayedVenues};
                const venueName = concert.venue.displayName;
                displayedVenues[venueName] = true;
                return (
                  <tr
                    key={i}
                    className={concertClasses}
                    onClick={() => window.open(concert.uri, '_blank')}
                  >
                    <td> {artistName} </td>
                    {!existing[venueName] ? <td>{venueName}</td> : null}

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default Listen;
