import React from 'react';
import styled from 'styled-components/primitives';
import {Text} from './App'

const Concerts = styled.Text`
  max-width: 600px;
  display: flex;
  flex-direction: column;
  text-align: left
`;
const ConcertStyle = styled.Text`
  margin-bottom: 20px;
  text-align: center;
  &:hover {
      color: red;
      cursor: pointer;
  }
`;
const Artists = styled.Text`
`;

const Concert = ({artistsConcerts, currentlyPlaying, displayedVenues}) => {
  const concertsMap = {};
  artistsConcerts.forEach(concert => {
    if (concertsMap[concert.concert.venue.displayName]) {
      concertsMap[concert.concert.venue.displayName].artists.push(concert);
    } else {
      concertsMap[concert.concert.venue.displayName] = {
        ...concert,
        artists: [concert.artistName],
      };
    }
  });

  return (
    <Concerts>
      {Object.keys(concertsMap).map((concert, i) => {
        const Artist = styled.Text`
          margin-left: 10px;
          ${concertsMap[concert].currentlyPlaying ? `color: #1DB954;` : ''}
        `;
        const ConcertName = styled.Text`
          font-size: 20px;
          opacity: .6;
          ${concertsMap[concert].currentlyPlaying ? `color: #1DB954;` : ''}
        `;
        return (
          <ConcertStyle
            key={i}
            onClick={() =>
              window.open(concertsMap[concert].concert.uri, '_blank')}
          >
            <ConcertName>{concert}</ConcertName>
            <Artists>
              {concertsMap[concert].concert.performance.map((artist, i) => (
                <Artist key={i + 1000}> {artist.displayName}</Artist>
              ))}
            </Artists>
          </ConcertStyle>
        );
      })}
    </Concerts>
  );
};

export default Concert;
