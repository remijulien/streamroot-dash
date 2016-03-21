import SegmentsGetter from '../src/dash/utils/SegmentsGetter';
import TrackView from './TrackView';

class SegmentsCache {

    constructor(player) {
        this._player = player;
        this._player.on('segmentsLoaded', this._onSegmentsLoaded, this);

        //TODO: check if cache should be flushed on player's 'representationUpdated' event
        this._cache = {};
    }

    _onSegmentsLoaded(event) {
        let segments = event.segments;
        let trackViewId = TrackView.makeIDString(
            event.representation.adaptation.period.index,
            event.representation.adaptation.index,
            event.representation.index
        );

        this._cache[trackViewId] = segments;
    };

    hasSegments(trackView) {
        return this._cache[trackView.viewToString()] !== undefined;
    }

}

export default SegmentsCache;
