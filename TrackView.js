//jshint -W098
class TrackView {

  constructor(obj) {
    this.periodId = obj.periodId;
    this.adaptationSetId = obj.adaptationSetId;
    this.representationId = obj.representationId;
  }

  static makeIDString(periodId, adaptationSetId, representationId) {
    return `P${periodId}A${adaptationSetId}R${representationId}`;
  }

  /**
    * @returns {String}
    */
  viewToString() {
    return TrackView.makeIDString(this.periodId, this.adaptationSetId, this.representationId);
  }

  /**
    * @param trackView {TrackView}
    * @returns {boolean}
    */
  isEqual(trackView){
    return !!trackView &&
        this.periodId === trackView.periodId &&
        this.adaptationSetId === trackView.adaptationSetId &&
        this.representationId === trackView.representationId;
  }
}

export default TrackView;
