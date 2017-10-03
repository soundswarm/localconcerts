import React from 'react';
import styled from 'styled-components/primitives';


const Player = styled.View`

`

const Container = styled.View`
  max-width: 600px;
  padding-bottom: 50px;
`;
const Current = styled.View`
  background-color: #282828;
  text-align: left;
  &:hover {
      color: red;
      cursor: pointer;
  }
`;

const Left = styled.View`
  margin-left: 93px;
  font-size: 13px;
  @media screen and (max-width: 720px) {
    margin-left: 5px;
  }
`;

const Right = styled.View`
  float: right;
  margin-right: 10px;
`;

const currentlyPlaying = ({concert, iframeSrc}) => {
  return (
    <Container>
      {concert
        ? <Current
            className="currentlyPlaying"
            onClick={() => window.open(concert.uri, '_blank')}
          >
            <Left>{`Venue:  ${concert.venue.displayName}`}</Left>
            <Right>{`Buy Tickets`}</Right>
          </Current>
        : null}

      <Player className="embed-container">
        <iframe
          title="spotifyplayer"
          className="player"
          src={iframeSrc}
          frameBorder="0"
          allowTransparency="true"
        />
      </Player>
    </Container>
  );
};

export default currentlyPlaying;
