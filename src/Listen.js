import React, {Component} from 'react';
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
const analytics = window.analytics;
class Listen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayTopConcerts: true,
      artistsConcerts: {topConcerts: [], tomorrowConcerts: []},
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
    this.tomorrowPlaylist=''
    this.topConcertsPlaylist=''
  }

  getCurrentSongAndDisplay = () => {
    actions.getCurrentSong().then(res => {
      const spotifySong = res.data.item;

      if (spotifySong && spotifySong.duration_ms) {
        setTimeout(this.getCurrentSongAndDisplay, 6000);
        const artistPlaying = spotifySong.artists[0].name;

        const newState = {...this.state};
        this.state.artistsConcerts[this.state.view].forEach((artist, i) => {
          if (ss.compareTwoStrings(artist.artistName, artistPlaying) > 0.5) {
            newState.artistsConcerts[this.state.view][
              i
            ].currentlyPlaying = true;
            newState.currentlyPlaying = newState.artistsConcerts[
              this.state.view
            ][i];
          } else {
            newState.artistsConcerts[this.state.view][
              i
            ].currentlyPlaying = null;
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


        this.spotifyUserId = data.id;

        analytics.identify(this.spotifyUserId, {
          ...data,
        });
        actions.getLocation().then(loc => {
          const locationName = loc.data.resultsPage.results.location[
            0
          ].city.displayName;
          this.setState({locationName});

          this.display(locationName);

          this.executeTopConcerts(spotify)
          // this.executeTomorrowConcerts(spotify)
        });
      });
    });
  }
  executeTomorrowConcerts = (spotify)=>{
    actions.getPlaylists(this.spotifyUserId).then(res => {
      const playlist = res.data.items.filter(playlist => {
        return playlist.name === this.tomorrowPlaylist;
      })[0];
      if (playlist) {
        this.playlistId = playlist.id;
        this.existingPlaylist = true;
        let uri = 'https://open.spotify.com/embed?uri=' + playlist.uri;
        this.setState({iframeSrc: uri, loading: false});
        analytics.track('iframeLoadedFromExisting', {uri});

        // if (this.state.view === 'topConcerts') {
        actions.getPlaylistTracks(playlist.href).then(res => {
          const playlistTracks = res.data.tracks.items.map((track, i) => {
            return {uri: track.track.uri, positions: [i]};
          });
          return actions
            .deletePlaylistTracks(
              this.spotifyUserId,
              playlist.id,
              playlistTracks,
            )
            .then(() => {
              return this.topArtistsConcerts()
                .then(artists => {
                  artists = artists.slice(0, this.maxSongsToDisplay);
                  const artistsConcerts = {
                    ...this.state.artistsConcerts,
                  };
                  artistsConcerts[this.state.view] = artists.slice(
                    0,
                    this.maxSongsToDisplay,
                  );
                  this.setState({
                    artistsConcerts,
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
                  return actions
                    .addTracksToPlaylist({
                      playlistId: playlist.id,
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
        // }
        // if (this.state.view === 'tomorrowConcerts') {
        this.getCurrentSongAndDisplay();
        this.artistsPlayingConcertsTomorrow().then(artists => {
          const artistsConcerts = {...this.state.artistsConcerts};
          artistsConcerts[this.state.view] = artists.slice(
            0,
            this.maxSongsToDisplay,
          );
          this.setState({artistsConcerts});
          if (this.state.view === 'tomorrowConcerts') {
            this.setState({
              concertDate: artistsConcerts[this.state.view][
                0
              ].concert.start.date,
            });
          }
        });
        // }
        return;
      }
      // if no plalist exists:
      // createPlaylistAndDisplay()
      actions
        .createNewPlaylist(
          {
            name: this.tomorrowPlaylist,
            description: 'A playlist by seemusiq.com',
          },
          this.spotifyUserId,
        )
        .then(r => {
          // handle this
          this.playListId = r.data.id;
          let uri = 'https://open.spotify.com/embed?uri=' + r.data.uri; //external_urls.spotify.replace('http', 'https')

          this.artistsPlayingConcertsTomorrow()
            .then(artists => {
              artists = artists.slice(0, this.maxSongsToDisplay);

              const artistsConcertsNewState = {
                ...this.state.artistsConcerts,
              };
              artistsConcertsNewState.tomorrowConcerts = artists.slice(
                0,
                this.maxSongsToDisplay,
              );

              this.setState({
                artistsConcerts: artistsConcertsNewState,
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
              console.log('TRACKS', tracks);
              const artistsConcerts = {...this.state.artistsConcerts};
              artistsConcerts[this.state.view] = tracks.slice(
                0,
                this.maxSongsToDisplay,
              );
              console.log('ARTISTSCONCERTS', artistsConcerts);
              this.setState({artistsConcerts});
              console.log('tracks', tracks);
              actions
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
  executeTopConcerts = (spotify)=>{
    actions.getPlaylists(this.spotifyUserId).then(res => {
      const playlist = res.data.items.filter(playlist => {
        return playlist.name === this.topConcertsPlaylist;
      })[0];
      if (playlist) {
        this.playlistId = playlist.id;
        this.existingPlaylist = true;
        let uri = 'https://open.spotify.com/embed?uri=' + playlist.uri;
        this.setState({iframeSrc: uri, loading: false});
        analytics.track('iframeLoadedFromExisting', {uri});

        // if (this.state.view === 'topConcerts') {
        actions.getPlaylistTracks(playlist.href).then(res => {
          const playlistTracks = res.data.tracks.items.map((track, i) => {
            return {uri: track.track.uri, positions: [i]};
          });
          return actions
            .deletePlaylistTracks(
              this.spotifyUserId,
              playlist.id,
              playlistTracks,
            )
            .then(() => {
              return this.topArtistsConcerts()
                .then(artists => {
                  artists = artists.slice(0, this.maxSongsToDisplay);
                  const artistsConcerts = {
                    ...this.state.artistsConcerts,
                  };
                  artistsConcerts[this.state.view] = artists.slice(
                    0,
                    this.maxSongsToDisplay,
                  );
                  this.setState({
                    artistsConcerts,
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
                  return actions
                    .addTracksToPlaylist({
                      playlistId: playlist.id,
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
        // }
        // if (this.state.view === 'tomorrowConcerts') {
        this.getCurrentSongAndDisplay();
        this.artistsPlayingConcertsTomorrow().then(artists => {
          const artistsConcerts = {...this.state.artistsConcerts};
          artistsConcerts[this.state.view] = artists.slice(
            0,
            this.maxSongsToDisplay,
          );
          this.setState({artistsConcerts});
          if (this.state.view === 'tomorrowConcerts') {
            this.setState({
              concertDate: artistsConcerts[this.state.view][
                0
              ].concert.start.date,
            });
          }
        });
        // }
        return;
      }
      // if no plalist exists:
      // createPlaylistAndDisplay()
      actions
        .createNewPlaylist(
          {
            name: this.topConcertsPlaylist,
            description: 'A playlist by seemusiq.com',
          },
          this.spotifyUserId,
        )
        .then(r => {
          // handle this
          this.playListId = r.data.id;
          let uri = 'https://open.spotify.com/embed?uri=' + r.data.uri; //external_urls.spotify.replace('http', 'https')

          // if (this.state.view === 'tomorrowConcerts') {

          // // this.artistsPlayingConcertsTomorrow()
          //   // this.topArtistsConcerts()
          //   .then(artists => {
          //     artists = artists.slice(0, this.maxSongsToDisplay);
          //
          //     const artistsConcertsNewState = {
          //       ...this.state.artistsConcerts,
          //     };
          //     artistsConcertsNewState.tomorrowConcerts = artists.slice(
          //       0,
          //       this.maxSongsToDisplay,
          //     );
          //
          //     this.setState({
          //       artistsConcerts: artistsConcertsNewState,
          //     });
          //     return Promise.all(
          //       artists.map(({artistName, concert}) => {
          //         const url = `https://api.spotify.com/v1/search?q=artist:${artistName}&type=track&limit=1`;
          //         return spotify.get(url).done(res => {
          //           return res.tracks.items.map(track => track.uri);
          //         });
          //       }),
          //     );
          //   })
          //   .then(tracks => {
          //     console.log('TRACKS', tracks);
          //     const artistsConcerts = {...this.state.artistsConcerts};
          //     artistsConcerts[this.state.view] = tracks.slice(
          //       0,
          //       this.maxSongsToDisplay,
          //     );
          //     console.log('ARTISTSCONCERTS', artistsConcerts);
          //     this.setState({artistsConcerts});
          //     console.log('tracks', tracks);
          //     actions
          //       .addTracksToPlaylist({
          //         playlistId: this.playListId,
          //         spotifyUserId: this.spotifyUserId,
          //         tracks: tracks.reduce(
          //           (mem, track) => {
          //             if (track.tracks.items[0]) {
          //               mem.push(track.tracks.items[0].uri);
          //             }
          //             return mem;
          //           },
          //           [],
          //         ),
          //       })
          //       .then(() => {
          //         this.getCurrentSongAndDisplay();
          //         this.setState({
          //           iframeSrc: uri,
          //           loading: false,
          //           showTomorrowButton: true,
          //         });
          //         analytics.track('iframeLoadedFromNew', {uri});
          //       });
          //   });

          // }

          // if (this.state.view === 'topConcerts') {
          this.topArtistsConcerts()
            .then(artists => {
              artists = artists.slice(0, this.maxSongsToDisplay);
              const artistsConcerts = {...this.state.artistsConcerts};
              artistsConcerts[this.state.view] = artists.slice(
                0,
                this.maxSongsToDisplay,
              );
              this.setState({
                artistsConcerts,
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
          // }
        });
    });
  }
  display = locationName => {
    this.topConcertsPlaylist = 'Top Concerts';
    let tomorrow = moment(new Date()).add(1, 'days').format('MMM DD');
    this.tomorrowPlaylist = locationName + ` - ${tomorrow}`;
  };
  render() {
    console.log(this.state)
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
          ? null
          : <TopConcerts
              {...{
                concertDate,
                locationName,
                iframeSrc,
                currentlyPlaying,
                artistsConcerts: artistsConcerts.topConcerts,
                loading,
                display: this.display,
              }}
            />}
      </div>
    );
  }
}

export default Listen;
