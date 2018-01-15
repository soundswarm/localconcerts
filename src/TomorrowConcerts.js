import React from 'react';
import tenor from './images/tenor.gif';
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
    displayTopConcerts,
    noTopConcerts
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
      {!loading && !noTopConcerts
        ? <Button
            className="switchConcertsButton left"
            onClick={() => displayTopConcerts()}
          >
            Show My Top Concerts
          </Button>
        : null}
        <div className="listenTitle">
          <div>
            CONCERTS
          </div>
          {concertDate ? <div className="on">on</div> : null}
          <div>
            {concertDate ? moment(concertDate).format('ddd MMM D') : null}
          </div>
          <div>
            {locationName}
          </div>
        </div>
      <Concerts
        currentlyPlaying={currentlyPlaying}
        artistsConcerts={artistsConcerts}
      />
    </div>
  );
};
