import SegmentView from './SegmentView';
import TrackView from './TrackView';

class MediaMap {
    constructor (manifestHelper) {
        this._manifestHelper = manifestHelper;

        var test = this.getSegmentList.bind(this,
                                           new TrackView({periodId: 0, adaptationSetId: 0, representationId: 0}),
                                           0,
                                           30);
    }

    /**
    * @param segmentView {SegmentView}
    * @returns number   (:warning: time must be in second if we want the debug tool (buffer display) to work properly)
    */
    getSegmentTime (segmentView) {
        return segmentView.segmentId;
    }

    /**
    * @param trackView {TrackView}
    * @param beginTime {number}
    * @param duration {number}
    * @returns [SegmentView]
    */
    getSegmentList (trackView, beginTime, duration) {
        let representation = this._manifestHelper.getRepresentation(trackView);
        let dashjsSegments = representation.segments;

        let segmentList = [];

        for (var segment of dashjsSegments) {
        }
    }
}

export default MediaMap;
