import React from 'react';
import tenor from './images/tenor.gif';
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
  return (
    <div>
      {loading
        ? <div className="gif">
            <img src={tenor} alt="fireSpot" />
          </div>
        : null}

      <CurrentlyPlaying iframeSrc={iframeSrc} {...currentlyPlaying} />
      {!loading
        ? <Button
            className="switchConcertsButton right"
            onClick={() => displayTomorrowConcerts()}
          >
            Show Concerts Tomorrow
          </Button>
        : null}
      <div className="listenTitle">
        CONCERTS
        <div>
          Recommended For You
        </div>
        <div>
          {locationName}
        </div>
      </div>
      <Concerts
        currentlyPlaying={currentlyPlaying}
        artistsConcerts={artistsConcerts}
        view="topConcerts"
      />
    </div>
  );
};
