import React from 'react';
import tenor from './tenor.gif';
import moment from 'moment';
import CurrentlyPlaying from './CurrentlyPlaying';
import Concerts from './Concerts';

export default ({concertDate, locationName, iframeSrc, currentlyPlaying, artistsConcerts, loading}) => {
  return (
    <div>
      <div className="listenTitle">
        LOCAL
        <div>
          CONCERTS
        </div>
        {concertDate ? <div className="on">on</div> : null}
        <div>
          {concertDate
            ? moment(concertDate).format('ddd MMM D')
            : null}
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
      <CurrentlyPlaying
        iframeSrc={iframeSrc}
        {...currentlyPlaying}
      />

      <Concerts
        currentlyPlaying={currentlyPlaying}
        artistsConcerts={artistsConcerts}
      />
    </div>
  );
};
