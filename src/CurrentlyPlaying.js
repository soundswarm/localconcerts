import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 600px;
  margin: auto
`;
const Current = styled.div`
  background-color: #282828;
  text-align: left;
  &:hover {
      color: red;
      cursor: pointer;
  }
`;

const currentlyPlaying = ({concert, iframeSrc}) => {
  return concert
    ? <Container>
        <Current onClick={() => window.open(concert.uri, '_blank')}>
          {concert.venue.displayName}
        </Current>
        <div className="embed-container">
          <iframe
            title="spotifyplayer"
            className="player"
            src={iframeSrc}
            frameBorder="0"
            allowTransparency="true"
          />
        </div>
      </Container>
    : null;
};

export default currentlyPlaying;
