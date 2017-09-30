import React from 'react';
import classnames from 'classnames';
import {ListGroup, ListGroupItem} from 'react-bootstrap';
import styled from 'styled-components';

const Concerts = styled.div`
  max-width: 600px;
  margin: auto;
  display: flex;
  flex-direction: column;
  text-align: left
`;
const ConcertStyle = styled.div`
  margin-bottom: 20px;
  text-align: center;
  &:hover {
      color: red;
      cursor: pointer;
  }
`;
const Artists = styled.span`
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
        const concertClasses = classnames({
          concert: true,
          currentlyPlaying,
        });
        const CurrentlyPlaying = styled.div`
         ${concertsMap[concert].currentlyPlaying ? `color: #1DB954;` : ''}
        `;
        const Artist = styled.div`
          margin-left: 10px;
          ${concertsMap[concert].currentlyPlaying ? `color: #1DB954;` : ''}
        `;
        const ConcertName = styled.div`
          font-size: 20px;
          opacity: .6;
          text-decoration: underline;
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
