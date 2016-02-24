//jshint -W098
class TrackView {

  constructor(obj) {
    this.periodId = obj.periodId;
    this.adaptationSetId = obj.adaptationSetId;
    this.representationId = obj.representationId;
  }

  /**
    * @returns {String}
    */
  viewToString() {
    return `P${this.periodId}A${this.adaptationSetId}R${this.representationId}`;
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
