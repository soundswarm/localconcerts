import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 600px;
  margin: auto;
  padding-bottom: 50px;
`;
const Current = styled.div`
  background-color: #282828;
  text-align: left;
  &:hover {
      color: red;
      cursor: pointer;
  }
`;

const Left = styled.span`
  margin-left: 93px;
  font-size: 13px;
  @media screen and (max-width: 720px) {
    margin-left: 5px;
  }
`;

const Right = styled.span`
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
  );
};

export default currentlyPlaying;
