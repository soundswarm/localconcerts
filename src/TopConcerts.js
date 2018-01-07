import React from 'react';
import tenor from './tenor.gif';
import moment from 'moment';
import {Button} from 'react-bootstrap';
import CurrentlyPlaying from './CurrentlyPlaying';
import Concerts from './Concerts';

export default (
  {
    concertDate,
    locationName,
    iframeSrc,
    currentlyPlaying,
    artistsConcerts,
    loading,
    displayTomorrowConcerts,
  },
) => {
  console.log('artistsConcerts', artistsConcerts);
  return (
    <div>
      <div className="listenTitle">
        CONCERTS
        <div>
          Recommended For You
        </div>
        <div>
          {locationName}
        </div>
      </div>
      {loading
        ? <div className="gif">
            <img src={tenor} alt="fireSpot" />
          </div>
        : null}
      {!loading
        ? <Button
            className="switchConcertsButton right"
            onClick={() => displayTomorrowConcerts()}
          >
            Show Concerts Tomorrow
          </Button>
        : null}
      <CurrentlyPlaying iframeSrc={iframeSrc} {...currentlyPlaying} />

      <Concerts
        currentlyPlaying={currentlyPlaying}
        artistsConcerts={artistsConcerts}
        view="topConcerts"
      />
    </div>
  );
};
