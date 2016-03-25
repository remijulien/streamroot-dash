import TrackView from './TrackView';

class PlayerInterface {

    constructor (player, manifestHelper, liveDelay) {
        this._player = player;
        this._manifestHelper = manifestHelper;
        this._liveDelay = liveDelay;

        this.MIN_BUFFER_LEVEL = 10;

        this._listeners = new Map();

        this._onStreamInitialized = this._dispatchInitialOnTrackChange.bind(this);
        this._player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, this._onStreamInitialized);
    }

    isLive () {
        return this._manifestHelper.isLive();
    }

    getBufferLevelMax () {
        return Math.max(0, this._liveDelay - this.MIN_BUFFER_LEVEL);
    }

    setBufferMarginLive(bufferLevel) {
        this._player.setStableBufferTime(this.MIN_BUFFER_LEVEL + bufferLevel);
        this._player.setBufferTimeAtTopQuality(this.MIN_BUFFER_LEVEL + bufferLevel);
        this._player.setBufferTimeAtTopQualityLongForm(this.MIN_BUFFER_LEVEL + bufferLevel); // TODO: can live be "long form" ?
    }

    addEventListener (eventName, observer) {
        if (eventName !== "onTrackChange") {
            console.error("Tried to listen to an event that wasn't onTrackChange");
            return;  // IMPORTANT: we need to return to avoid errors in _dispatchInitialOnTrackChange
        }

        var onTrackChangeListener = this._createOnTrackChangeListener(observer);
        this._listeners.set(observer, onTrackChangeListener);

        this._player.on('qualityChanged', onTrackChangeListener); //TODO: hardcoded event name. Get it from enum
    }

    removeEventListener(eventName, observer) {
        if (eventName !== "onTrackChange") {
            console.error("Tried to remove listener for an event that wasn't onTrackChange");
            return;
        }

        var onTrackChangeListener = this._listeners.get(observer);

        this._player.off('qualityChanged', onTrackChangeListener); //TODO: hardcoded event name. Get it from enum

        this._listeners.delete(observer);
    }

    _createOnTrackChangeListener (observer) {
        let player = this._player;

        return function({ mediaType, streamInfo, oldQuality, newQuality}) {
            var tracks = {};
            tracks[mediaType] = new TrackView({
                periodId: streamInfo.index,
                adaptationSetId: player.getCurrentTrackFor(mediaType).index,
                representationId: Number(newQuality)
            });

            observer(tracks);
        };
    }

    _dispatchInitialOnTrackChange () {
        let tracks = this._manifestHelper.getCurrentTracks();

        for (let [ observer, ...rest] of this._listeners) {
            observer(tracks);
        }
    }

}

export default PlayerInterface;
