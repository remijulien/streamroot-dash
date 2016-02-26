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

        if (dashjsSegmentList === undefined) {
            return segmentList;
        }

        for (var segment of dashjsSegmentList) {
            if (beginTime <= segment.mediaStartTime && segment.mediaStartTime <= beginTime + duration) {
                segmentView = new SegmentView({
                    trackView,
                    segmentId: Math.round(segment.mediaStartTime * 10) //TODO: make this static method of SegmentView
                });
                segmentList.push(segmentView);
            }
        }

        return segmentList;
    }

    getNextSegmentView(segmentView) {
        var beginTime = this.getSegmentTime(segmentView) + 0.2;
        // +0.2 will give us a beginTime just after the beginning of the segmentView, so we know it won't be included in the following getSegmentList (condition includes beginTime <= segment.mediaStartTime)

        var segmentList = this.getSegmentList(segmentView.trackView, beginTime, 30);
        return segmentList.length ? segmentList[0] : null;
    }

    getTracksList () {
        let tracks = this._manifestHelper.getTracks(),
            trackArray = [];

        // Kind of sucks that we don't expect the same format than in onTrackChange
        for (let type of ["audio", "video"]) {
            if (tracks[type]) {
                trackArray.push(tracks[type]);
            }
        }

        return trackArray;
    }
}

export default MediaMap;
