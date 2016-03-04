class ManifestHelper {

    constructor (player) {

        let getManifestModel,
            getDashManifestModel;

        function StreamSR () {
            let factory = this.factory,
                context = this.context;

            getManifestModel = function () {
                return factory.getSingletonInstance(context, "ManifestModel");
            }

            getDashManifestModel = function () {
                return factory.getSingletonInstance(context, "DashManifestModel");
            }

            return { getManifestModel, getDashManifestModel }
        }

        player.extend("Stream", StreamSR, true);

        this._getManifest = function () {
            return getManifestModel ? getManifestModel().getValue() : undefined;
        }

        this._getDashManifestModel = function () {
            return getDashManifestModel ? getDashManifestModel() : undefined;
        }
    }

    getRepresentation (trackView) {
        var manifest = this._getManifest(),
            dashManifestModel = this._getDashManifestModel();

        if (!manifest || !dashManifestModel) throw new Error("Tried to get representation we could have access to dash.js manifest internals");

        var adaptation = dashManifestModel.getAdaptationForIndex(trackView.adaptationSetId, manifest, trackView.periodId);
        return dashManifestModel.getRepresentationFor(trackView.representationId, adaptation);
    }

    getSegment (segmentView) {
        var representation = this.getRepresentation(segmentView.trackView);
        return representation.segments[segmentView.segmentId];
    }

}

export default ManifestHelper;
