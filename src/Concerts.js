import React from 'react';
import classnames from 'classnames';
import {ListGroup, ListGroupItem} from 'react-bootstrap';
import styled from 'styled-components';

const Concerts = styled.div`
  max-width: 600px;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: left;
  text-align: left
`;
const ConcertStyle = styled.div`
  margin-bottom: 20px;
  &:hover {
      color: red;
      cursor: pointer;

  }
`;

const Artist = styled.div`
  margin-left: 10px;
`;
const ConcertName = styled.div`
  font-size: 15px;
`;

const Concert = ({artistsConcerts, currentlyPlaying, displayedVenues}) => {
  const concertsMap = {};
  artistsConcerts.forEach(concert => {
    console.log('CONCERT', concert);
    if (concertsMap[concert.concert.venue.displayName]) {
      concertsMap[concert.concert.venue.displayName].artists.push(concert);
    } else {
      concertsMap[concert.concert.venue.displayName] = {
        ...concert,
        artists: [concert.artistName],
      };
    }
  });
  // {artistsConcerts.map(({
  //   artistName,
  //   concert,
  //   currentlyPlaying,
  // }, i) => {
  //   const concertClasses = classnames({
  //     concert: true,
  //     currentlyPlaying,
  //   });
  //   const existing = {...displayedVenues};
  //   const venueName = concert.venue.displayName;
  //   displayedVenues[venueName] = true;
  //   return (
  //     <div
  //       key={i}
  //       className={concertClasses}
  //       onClick={() => window.open(concert.uri, '_blank')}
  //     >
  //       <div> {artistName} </div>
  //       {!existing[venueName] ? <td>{venueName}</td> : null}
  //
  //     </div>
  //   );
  // })}

  return (
    <Concerts>

      {Object.keys(concertsMap).map((concert, i) => {
        const concertClasses = classnames({
          concert: true,
          currentlyPlaying,
        });
        console.log(concertsMap[concert]);
        return (
          <ConcertStyle
            key={i}
            onClick={() =>
              window.open(concertsMap[concert].concert.uri, '_blank')}
          >
            <ConcertName>{concert}</ConcertName>
            {concertsMap[concert].concert.performance.map(artist => (
              <Artist> {artist.displayName}</Artist>
            ))}

          </ConcertStyle>
        );
      })}
    </Concerts>
  );
};

export default Concert;
