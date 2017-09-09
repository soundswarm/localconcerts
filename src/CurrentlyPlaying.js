import React from 'react';
import styled from 'styled-components';
console.log('STYLED', styled);

const Container = styled.div`
  background-color: #282828;
  text-align: left;
  margin-left: 20px;
  margin-right: 20px;
  &:hover {
      color: red;
      cursor: pointer;
  }
`;

const currentlyPlaying = ({concert}) => {
  return concert
    ? <Container onClick={() => window.open(concert.uri, '_blank')}>
        {concert.venue.displayName}
      </Container>
    : null;
};

export default currentlyPlaying;
