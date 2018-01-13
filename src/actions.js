import axios from 'axios';
import moment from 'moment';

const userip = window.userip;
const url = 'https://api.spotify.com/v1/';

let ax = null;
export function initializeAxios(accessToken) {
  ax = axios.create({
    headers: {Authorization: 'Bearer ' + accessToken},
  });
}

export const getPlaylists = (spotifyUserId) => {
  return ax({
    method: 'get',
    url: `${url}users/${spotifyUserId}/playlists`,
    limit: 50,
  });
};

export const getCurrentSong = () => {
  return ax({
    method: 'get',
    url: `${url}me/player/currently-playing`,
  });
};
export const getLocation = () => {
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
export const addTracksToPlaylist = ({spotifyUserId, playlistId, tracks}) => {
  return ax({
    method: 'post',
    url: `https://api.spotify.com/v1/users/${spotifyUserId}/playlists/${playlistId}/tracks`,
    data: {uris: tracks},
  });
};
export const getTomorrowConcerts = () => {
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
      per_page: 50,
    },
  });
};
export const getArtistConcerts = artist_name => {
  const searchEvents = 'https://api.songkick.com/api/3.0/events.json';
  return axios({
    url: searchEvents,
    method: 'GET',
    params: {
      apikey: 'Z7OwHVINevycipT7',
      location: `ip:${userip}`,
      artist_name,
      per_page: 50,
    },
  });
};
export const createNewPlaylist = (datas, spotifyUserId) => {
  return ax({
    method: 'post',
    url: `${url}users/${spotifyUserId}/playlists`,
    data: {...datas},
  });
};

export const getUsersFollowedArtsists = () => {
  return ax({
    method: 'get',
    url: `https://api.spotify.com/v1/me/following?type=artist`,
    params: {limit: 50},
  });
};
export const getUsersTopArtists = (url = `https://api.spotify.com/v1/me/top/artists`) => {
  return ax({
    method: 'get',
    url,
    params: {limit: 50},
  });
};

export const deletePlaylistTracks = (userId, playlistId, tracks) => {
  return ax({
    method: 'delete',
    url: `${url}users/${userId}/playlists/${playlistId}/tracks`,
    data: {tracks}
  });

};
export const getPlaylistTracks = (url) => {
  return ax({
    method: 'get',
    url,
  });
};

export const getSpotifyUser = () => {
  return ax({
    method: 'get',
    url: 'https://api.spotify.com/v1/me',
  });
};

export const getArtistTrack = (artistName) => {
  return ax({
    method: 'get',
    url: `https://api.spotify.com/v1/search?q=artist:${artistName}&type=track&limit=1`,
  })
  .then(res=>{
      return res.data.tracks.items.map(track => track.uri)[0];

  })
};
