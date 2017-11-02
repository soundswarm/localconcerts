import React, {Component} from 'react';
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
import ss from 'string-similarity';
import CurrentlyPlaying from './CurrentlyPlaying';
import Concerts from './Concerts';
import TomorrowConcerts from './TomorrowConcerts';
import TopConcerts from './TopConcerts';
import tenor from './tenor.gif';
import * as actions from './actions';
const OAuth = window.OAuth;
const url = 'https://api.spotify.com/v1/';
class Listen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayTopConcerts: true,
      artistsConcerts: [],
      currentlyPlaying: {},
      locationName: '',
      loading: false,
      view: 'topConcerts',
      showTomorrowButton: false,
    };
    this.ax = null;
    this.concertDate = null;
    this.q = [];
    this.iframeSrc = '';
    this.userFollowedArtists = [];
    this.maxSongsToDisplay = 100;
  }

  getCurrentSongAndDisplay = () => {
    actions.getCurrentSong().then(res => {
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

  getUsersAllTopArtists = (url, artists = []) => {
    return actions.getUsersTopArtists(url).then(topArtists => {
      artists = artists.concat(topArtists.data.items);
      if (topArtists.data.next) {
        return this.getUsersAllTopArtists(topArtists.data.next, artists);
      }
      return artists;
    });
  };

  artistsPlayingConcertsTomorrow = () => {
    const tomorrow = moment(new Date()).add(1, 'days');
    return actions.getTomorrowConcerts().then(function(res) {
      const concerts = res.data.resultsPage.results.event;
      concerts.sort((a, b) => b.popularity - a.popularity);
      const artists = [];
      concerts.forEach(concert => {
        concert.performance.forEach(artist => {
          const artistName = artist.artist.displayName;
          if (moment(concert.start.date).format('l') === tomorrow.format('l')) {
            artists.push({artistName, concert});
          }
        });
      });
      return artists;
    });
  };
  topArtistsConcerts = () => {
    return this.getUsersAllTopArtists().then(topArtists => {
      this.userTopArtists = topArtists;
      return Promise.all(
        topArtists.map(artist => {
          return actions.getArtistConcerts(artist.name);
        }),
      ).then(re => {
        const artists = [];
        const actualConcerts = re
          .filter(r => r.data.resultsPage.totalEntries > 0)
          .forEach(res => {
            const concert = res.data.resultsPage.results.event[0];
            concert.performance.forEach(artist => {
              const artistName = artist.artist.displayName;
              artists.push({artistName, concert});
            });
          });

        return artists.sort((a, b) => {
          return moment(a.concert.start.date) < moment(b.concert.start.date)
            ? -1
            : 1;
        });
      });
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

      actions.initializeAxios(this.accessToken);

      spotify.me().done(data => {
        const analytics = window.analytics;

        this.spotifyUserId = data.id;

        analytics.identify(this.spotifyUserId, {
          ...data,
        });
        actions.getLocation().then(loc => {
          const locationName = loc.data.resultsPage.results.location[
            0
          ].city.displayName;
          this.setState({locationName});
          if (this.state.view === 'topConcerts') {
            this.playlist = 'myTopConcerts';
          }
          if (this.state.view === 'tomorrowConcerts') {
            let tomorrow = moment(new Date()).add(1, 'days').format('MMM DD');
            this.playlist = locationName + ` - ${tomorrow}`;
          }

          actions.getPlaylists(this.spotifyUserId).then(res => {
            const playlist = res.data.items.filter(playlist => {
              return playlist.name === this.playlist;
            })[0];
            console.log('PLAYLIST', playlist)
            if (playlist) {
              console.log('CONDITION PASSED')
              this.playlistId = playlist.id;
              this.existingPlaylist = true;
              let uri = 'https://open.spotify.com/embed?uri=' + playlist.uri;
              this.setState({iframeSrc: uri, loading: false});
              analytics.track('iframeLoadedFromExisting', {uri});
              if (this.state.view === 'topConcerts') {
                actions.getPlaylistTracks(playlist.href).then(res => {
                  const playlistTracks = res.data.tracks.items.map(
                    (track, i) => {
                      return {uri: track.track.uri, positions: [i]};
                    },
                  );
                  actions
                    .deletePlaylistTracks(
                      this.spotifyUserId,
                      playlist.id,
                      playlistTracks,
                    )
                    .then(() => {
                      return this.topArtistsConcerts()
                        .then(artists => {
                          artists = artists.slice(0, this.maxSongsToDisplay);
                          this.setState({
                            artistsConcerts: artists.slice(
                              0,
                              this.maxSongsToDisplay,
                            ),
                          });
                          return Promise.all(
                            artists.map(({artistName, concert}) => {
                              const url = `https://api.spotify.com/v1/search?q=artist:${artistName}&type=track&limit=1`;
                              return spotify.get(url).done(res => {
                                return res.tracks.items.map(track => track.uri);
                              });
                            }),
                          );
                        })
                        .then(tracks => {
                          console.log('pid', this, tracks);
                          return actions
                            .addTracksToPlaylist({
                              playlistId: this.playListId,
                              spotifyUserId: this.spotifyUserId,
                              tracks: tracks.reduce(
                                (mem, track) => {
                                  if (track.tracks.items[0]) {
                                    mem.push(track.tracks.items[0].uri);
                                  }
                                  return mem;
                                },
                                [],
                              ),
                            })
                            .then(() => {
                              this.getCurrentSongAndDisplay();
                              this.setState({
                                iframeSrc: uri,
                                loading: false,
                                showTomorrowButton: true,
                              });
                              analytics.track('iframeLoadedFromNew', {uri});
                            });
                        });
                    });
                });
              }
              if (this.state.view === 'tomorrowConcerts') {
                this.getCurrentSongAndDisplay();
                this.artistsPlayingConcertsTomorrow().then(artists => {
                  const artistsConcerts = artists.slice(
                    0,
                    this.maxSongsToDisplay,
                  );
                  this.setState({artistsConcerts});
                  if (this.state.view === 'tomorrowConcerts') {
                    this.setState({
                      concertDate: artistsConcerts[0].concert.start.date,
                    });
                  }
                });
                return;
              }
            }
            // if no plalist exists:
            // createPlaylistAndDisplay()
            actions
              .createNewPlalist(
                {
                  name: this.playlist,
                  description: 'A playlist by seemusiq.com',
                },
                this.spotifyUserId,
              )
              .then(r => {
                // handle this
                this.playListId = r.data.id;
                let uri = 'https://open.spotify.com/embed?uri=' + r.data.uri; //external_urls.spotify.replace('http', 'https')
                // // this.artistsPlayingConcertsTomorrow().then(tracks => {
                //   console.log('TRACKS', tracks);
                //   actions
                //     .addTracksToPlaylist({
                //       playlistId: this.playListId,
                //       spotifyUserId: this.spotifyUserId,
                //       tracks: tracks.reduce(
                //         (mem, track) => {
                //           if (track.tracks.items[0]) {
                //             mem.push(track.tracks.items[0].uri);
                //           }
                //           return mem;
                //         },
                //         [],
                //       ),
                //     })
                //     .then(() => {
                //       this.getCurrentSongAndDisplay();
                //       this.setState({
                //         iframeSrc: uri,
                //         loading: false,
                //         showTomorrowButton: true,
                //       });
                //       analytics.track('iframeLoadedFromNew', {uri});
                //     });
                // });

                if(this.state.view==='topConcerts') {
                    return this.topArtistsConcerts()
                      .then(artists => {
                        artists = artists.slice(0, this.maxSongsToDisplay);
                        this.setState({
                          artistsConcerts: artists.slice(
                            0,
                            this.maxSongsToDisplay,
                          ),
                        });
                        return Promise.all(
                          artists.map(({artistName, concert}) => {
                            const url = `https://api.spotify.com/v1/search?q=artist:${artistName}&type=track&limit=1`;
                            return spotify.get(url).done(res => {
                              return res.tracks.items.map(track => track.uri);
                            });
                          }),
                        );
                      })
                      .then(tracks => {
                        console.log('pid', this, tracks);
                        return actions
                          .addTracksToPlaylist({
                            playlistId: this.playListId,
                            spotifyUserId: this.spotifyUserId,
                            tracks: tracks.reduce(
                              (mem, track) => {
                                if (track.tracks.items[0]) {
                                  mem.push(track.tracks.items[0].uri);
                                }
                                return mem;
                              },
                              [],
                            ),
                          })
                          .then(() => {
                            this.getCurrentSongAndDisplay();
                            this.setState({
                              iframeSrc: uri,
                              loading: false,
                              showTomorrowButton: true,
                            });
                            analytics.track('iframeLoadedFromNew', {uri});
                          });
                      });

                }
              });
          });
        });
      });
    });
  }
  display = view => {
    this.setState({view});
  };
  render() {
    const {
      concertDate,
      locationName,
      iframeSrc,
      currentlyPlaying,
      artistsConcerts,
      loading,
    } = this.state;
    return (
      <div className="app">
        {this.state.view === 'tomorrowConcerts'
          ? <TomorrowConcerts
              {...{
                concertDate,
                locationName,
                iframeSrc,
                currentlyPlaying,
                artistsConcerts,
                loading,
                display: this.display,
              }}
            />
          : <TopConcerts
              {...{
                concertDate,
                locationName,
                iframeSrc,
                currentlyPlaying,
                artistsConcerts,
                loading,
                display: this.display,
              }}
            />}
      </div>
    );
  }
}

export default Listen;
