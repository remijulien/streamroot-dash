import TrackView from './TrackView';

class SegmentView {

  /**
  * @param arrayBuffer {ArrayBuffer}
  * @returns {SegmentView}
  */
  static fromArrayBuffer(arrayBuffer){
    var u32Data = new Uint32Array(arrayBuffer),
        [ periodId, adaptationSetId, representationId, segmentId ] = u32Data;
    return new SegmentView({
      trackView: new TrackView({ periodId, adaptationSetId, representationId }),
      segmentId
    });
  }

  /**
    * @param {Object} object
    */
  constructor(obj){
    this.segmentId = obj.segmentId;
    this.trackView = new TrackView(obj.trackView);
  }

  /**
    * Determines if a segment represent the same media chunk than another segment
    * @param segmentView {SegmentView}
    * @returns {boolean}
    */
  isEqual(segmentView) {
    if(!segmentView){
      return false;
    }
    let {segmentId, trackView} = segmentView;
    return this.segmentId === segmentId && this.trackView.isEqual(trackView);
  }

  /**
    * @param trackView {TrackView}
    * @returns {boolean}
    */
  isInTrack(trackView) {
    return this.trackView.isEqual(trackView);
  }

  /**
    * @returns {String}
    */
  viewToString() {
    return `${this.trackView.viewToString()}S${this.segmentId}`;
  }

  /**
    * @returns {ArrayBuffer}
    */
  toArrayBuffer() {
    return new Uint32Array([this.trackView.periodId, this.trackView.adaptationSetId, this.trackView.representationId, this.segmentId]).buffer;
  }
}

export default SegmentView;
