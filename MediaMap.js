import SegmentView from './SegmentView';
import TrackView from './TrackView';

class MediaMap {
    constructor (manifestHelper) {
        this._manifestHelper = manifestHelper;
    }

    /**
    * @param segmentView {SegmentView}
    * @returns number   (:warning: time must be in second if we want the debug tool (buffer display) to work properly)
    */
    getSegmentTime (segmentView) {
        return segmentView.segmentId / 10;
    }

    /**
    * @param trackView {TrackView}
    * @param beginTime {number}
    * @param duration {number}
    * @returns [SegmentView]
    */
    getSegmentList (trackView, beginTime, duration) {
        let dashjsSegmentList = this._manifestHelper.getSegmentList(trackView);

        let segmentList = [],
            segmentView;

        for (var segment of dashjsSegmentList) {
            if (beginTime <= segment.mediaStartTime && segment.mediaStartTime <= beginTime + duration) {
                segmentView = new SegmentView({
                    trackView,
                    segmentId: Math.round(segment.mediaStartTime * 10)
                });
                segmentList.push(segmentView);
            }
        }
        return segmentList;
    }
}

export default MediaMap;
