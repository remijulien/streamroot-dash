import TrackView from '.TrackView';

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

    addEventListener (eventName, observer) {
        var eventBus = this._manifestHelper.getEventBus();

        if (!eventBus) throw new Error("No eventBus yet");
        if (eventName !== "onTrackChange") throw new Error("Tried to listen to an event that wasn't onTrackChange")

        var onTrackChangeListener = this._createOnTrackChangeListener(observer)
        this._listeners.set(observer, onTrackChangeListener});

        eventBus.on('qualityChanged', onTrackChangeListener); //TODO: hardcoded event name. Get it from enum
    }

    removeEventListener(eventName, observer) {
        if (eventName !== "onTrackChange") throw new Error("Tried to remove listener for an event that wasn't onTrackChange")

        var onTrackChangeListener = this._listeners.get(observer);

        eventBus.off('qualityChanged', onTrackChangeListener); //TODO: hardcoded event name. Get it from enum

        this._listeners.delete(observer);
    }
}

export default PlayerInterface;
