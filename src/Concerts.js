import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
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

const ConcertInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-left: 30px;
`;
const Concert = ({artistsConcerts, currentlyPlaying, view}) => {
  const concertsMap = {};
  artistsConcerts.forEach(concert => {
    if (concert && concert.concert) {
      if (concertsMap[concert.concert.venue.displayName]) {
        concertsMap[concert.concert.venue.displayName].artists.push(concert);
      } else {
        concertsMap[concert.concert.venue.displayName] = {
          ...concert,
          artists: [concert.artistName],
        };
      }
    }
  });

  return (
    <Concerts>
      {Object.keys(concertsMap).map((concert, i) => {
        const Artist = styled.span`
          margin-left: 10px;
          font-size: 20px;
          ${concertsMap[concert].currentlyPlaying ? `color: #1DB954;` : ''}
        `;

        const ConcertName = styled.div`
          font-size: 16px;
          opacity: .6;
          ${concertsMap[concert].currentlyPlaying ? `color: #1DB954;` : ''}
        `;
        const ConcertDate = styled.span`
          font-size: 16px;
          opacity: .6;
          text-decoration: none;
          ${concertsMap[concert].currentlyPlaying ? `color: #1DB954;` : ''}
          margin-left: 20px;
        `;
        return (
          <ConcertStyle
            key={i}
            onClick={() =>
              window.open(concertsMap[concert].concert.uri, '_blank')}
          >
            {' '}
            <Artists>
              {concertsMap[concert].concert.performance.map((artist, i) => (
                <Artist key={i + 1000}> {artist.displayName}</Artist>
              ))}
            </Artists>
            <ConcertInfo>
              <ConcertName>
                {concert}
              </ConcertName>
              {view === 'topConcerts'
                ? <ConcertDate>
                    {moment(concertsMap[concert].concert.start.date).format(
                      'MMM Do',
                    )}
                  </ConcertDate>
                : null}
            </ConcertInfo>

          </ConcertStyle>
        );
      })}
    </Concerts>
  );
};

export default Concert;
