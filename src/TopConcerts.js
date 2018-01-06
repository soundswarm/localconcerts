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
  return (
    <div>
      <div className="listenTitle">
        CONCERTS
        <div>
          Recommended For You
        </div>
        {concertDate ? <div className="on">on</div> : null}
        <div>
          {concertDate ? moment(concertDate).format('ddd MMM D') : null}
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
        ? <Button onClick={() => displayTomorrowConcerts()}>
            Show Concerts Tomorrow
          </Button>
        : null}
      <CurrentlyPlaying iframeSrc={iframeSrc} {...currentlyPlaying} />

      <Concerts
        currentlyPlaying={currentlyPlaying}
        artistsConcerts={artistsConcerts}
      />
    </div>
  );
};
