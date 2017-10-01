import React, {Component} from 'react';
import './App.css';
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
import ss from 'string-similarity';
import classnames from 'classnames';
import CurrentlyPlaying from './CurrentlyPlaying';
import Concerts from './Concerts';
import tenor from './tenor.gif';

const OAuth = window.OAuth;
const userip = window.userip;
const url = 'https://api.spotify.com/v1/';
class Listen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      artistsConcerts: [],
      currentlyPlaying: {},
      locationName: '',
      loading: false,
    };
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
  getLocation = () => {
    const locationUrl = 'https://api.songkick.com/api/3.0/search/locations.json';
    return axios({
      url: locationUrl,
      method: 'GET',
      params: {
        apikey: 'Z7OwHVINevycipT7',
        location: `ip:${userip}`,
      },
    });
  };
  addTracksToPlaylist = ({spotifyUserId,playlistId,tracks}) => {
    return this.ax({
      method: 'post',
      url: `https://api.spotify.com/v1/users/${spotifyUserId}/playlists/${playlistId}/tracks`,
      data: {uris: tracks},
    });
  };
  getCurrentSongAndDisplay = () => {
    this.getCurrentSong().then(res => {
      const spotifySong = res.data.item;

      if (spotifySong && spotifySong.duration_ms) {
        setTimeout(this.getCurrentSongAndDisplay, 6000);
        const artistPlaying = spotifySong.artists[0].name;

        const newState = {...this.state};
        this.state.artistsConcerts.forEach((artist, i) => {
          if (ss.compareTwoStrings(artist.artistName, artistPlaying) > 0.5) {
            newState.artistsConcerts[i].currentlyPlaying = true;
            newState.currentlyPlaying = newState.artistsConcerts[i];
          } else {
            newState.artistsConcerts[i].currentlyPlaying = null;
          }
        });
        this.setState(newState);
      }
    });
  };

  componentDidMount() {
    this.setState({loading: true});
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

        let playlist = moment(new Date()).add(1, 'days').format('MMM DD');
        this.getLocation().then(loc => {
          const locationName = loc.data.resultsPage.results.location[
            0
          ].city.displayName;
          this.setState({locationName});
          this.playlist = locationName + ` - ${playlist}`;
          // this.playlist = `concerts.dance - ${playlist}`;
          this.getPlaylists().then(res => {
            const playlist = res.data.items.filter(playlist => {
              return playlist.name === this.playlist;
            })[0];
            if (playlist) {
              let uri = 'https://open.spotify.com/embed?uri=' + playlist.uri;
              const iframe = document.querySelector('.player');
              this.setState({iframeSrc: uri, loading: false});
              this.getCurrentSongAndDisplay();
              artistsPlayingConcerts().then(artists => {
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
              data: {
                name: this.playlist,
                description: 'A playlist by http://concerts.dance',
              },
            }).then(r => {
              var wtf = r.data.id
              this.playListId = r.data.id;
              let uri = 'https://open.spotify.com/embed?uri=' + r.data.uri; //external_urls.spotify.replace('http', 'https')
              artistsPlayingConcerts().then(artists => {
                this.setState({artistsConcerts: artists.slice(0, 30)});
                return Promise.all(
                  artists.map(({artistName, concert}) => {
                    const url = `https://api.spotify.com/v1/search?q=artist:${artistName}&type=track&limit=1`;
                    return spotify.get(url).done(res => {
                      return res.tracks.items.map(track => track.uri);
                    });
                  }),
                )
              })
              .then(tracks => {
                this.addTracksToPlaylist({
                  playlistId: wtf,
                  spotifyUserId: this.spotifyUserId,
                  tracks: tracks.reduce((mem,track)=>{
                    if(track.tracks.items[0]) {
                      mem.push(track.tracks.items[0].uri)
                    }
                    return mem
                  },[]),
                })
                .then(()=>{
                  this.getCurrentSongAndDisplay();
                  this.setState({iframeSrc: uri, loading: false});
                })
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
      const searchEvents = 'https://api.songkick.com/api/3.0/events.json';
      let tomorrow = moment(new Date()).add(1, 'days');
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
        const artists = [];

        concerts.forEach(concert => {
          concert.performance.forEach(artist => {
            const artistName = artist.artist.displayName;
            if (
              moment(concert.start.date).format('l') === tomorrow.format('l')
            ) {
              artists.push({artistName, concert});
            }
          });
        });
        return artists;
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
          {this.state.concertDate ? <div className="on">on</div> : null}
          <div>
            {this.state.concertDate
              ? moment(this.state.concertDate).format('ddd MMM D')
              : null}
          </div>
          <div>
            {this.state.locationName}
          </div>
        </div>
        {this.state.loading
          ? <div className="gif">
              <img src={tenor} alt="fireSpot" />
            </div>
          : null}
        <CurrentlyPlaying
          iframeSrc={this.state.iframeSrc}
          {...this.state.currentlyPlaying}
        />

        <Concerts
          displayedVenues={displayedVenues}
          currentlyPlaying={this.state.currentlyPlaying}
          artistsConcerts={this.state.artistsConcerts}
        />
      </div>
    );
  }
}

export default Listen;
