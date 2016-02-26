import TrackView from './TrackView';

class PlayerInterface {

    constructor (manifestHelper) {
        this._manifestHelper = manifestHelper;

        this._listeners = new Map();
    }

    isLive () {
        return this._manifestHelper.isLive();
    }

    getBufferLevelMax () {
        return 20; //TODO: hardcoded value, do the actual implementation
    }

    setBufferMarginLive(bufferLevel) {
        //TODO: do the actual implementation
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
        return function({ mediaType, streamInfo, oldQuality, newQuality}) {
            var tracks = {};
            tracks[mediaType] = new TrackView({
                periodId: streamInfo.index,
                adaptationSetId: mediaType === "video" ? 0 : 1, //TODO: hardcoded this for envivio stream
                representationId: newQuality
            });

            observer({ tracks })
        }
    }



}

export default PlayerInterface;
