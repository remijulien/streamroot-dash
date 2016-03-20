import TrackView from './TrackView';
import SegmentsGetter from '../src/dash/utils/SegmentsGetter';

class ManifestHelper {

    constructor (player) {

        this._player = player;

        let getConfig,
            getContext,
            getManifestModel,
            getDashManifestModel,
            getTimelineConverter;

        function StreamSR (config) {

            let factory = this.factory,
                context = this.context;

            getConfig = function() {
                return config;
            };

            getContext = function() {
                return context;
            };

            getManifestModel = function () {
                return factory.getSingletonInstance(context, "ManifestModel");
            };

            getDashManifestModel = function () {
                return factory.getSingletonInstance(context, "DashManifestModel");
            };

            getTimelineConverter = function () {
                return config.timelineConverter;
            };
        }

        player.extend("Stream", StreamSR, true);

        this._getManifest = function () {
            return getManifestModel ? getManifestModel().getValue() : undefined;
        };

        this._getDashManifestModel = function () {
            return getDashManifestModel ? getDashManifestModel() : undefined;
        };

        this._getTimelineConverter = function () {
            return getTimelineConverter ? getTimelineConverter() : undefined;
        };

        this._getConfig = function() {
            return getConfig();
        };

        this._getContext = function() {
            return getContext();
        };

        this._getSegmentsGetter = function() {
            if (!this._segmentsGetter) {
                let context = this._getContext();
                let config = this._getConfig();

                this._segmentsGetter = SegmentsGetter(context).create(config, this.isLive());
            }

            return this._segmentsGetter;
        }
    }

    getSegmentList (trackView) {
        var manifest = this._getManifest(),
            dashManifestModel = this._getDashManifestModel(),
            timelineConverter = this._getTimelineConverter();

        if (!manifest || !dashManifestModel || !timelineConverter) throw new Error("Tried to get representation before we could have access to dash.js manifest internals");

        var mpd = dashManifestModel.getMpd(manifest);
        var period = dashManifestModel.getRegularPeriods(manifest, mpd)[trackView.periodId];
        var adaptation = dashManifestModel.getAdaptationsForPeriod(manifest, period)[trackView.adaptationSetId];
        var representation = dashManifestModel.getRepresentationsForAdaptation(manifest, adaptation)[trackView.representationId];
        var isDynamic = this.isLive();

        representation.segmentAvailabilityRange = timelineConverter.calcSegmentAvailabilityRange(representation, isDynamic); //TODO: we might want to offset that range to get segments that go further than dash.js buffer zone
        return this._getSegmentsGetter().getSegments(representation);
    }

    getSegment (segmentView) {
        var representation = this.getRepresentation(segmentView.trackView);
        return representation.segments[segmentView.segmentId];
    }

    isLive () {
        var manifest = this._getManifest(),
            dashManifestModel = this._getDashManifestModel();

        if (!manifest || !dashManifestModel) throw new Error("Tried to get representation before we could have access to dash.js manifest internals");

        return dashManifestModel.getIsDynamic(manifest);
    }

    getTracks () {
        var tracks = {};
        for (let type of ["audio", "video"]) {
            let tracksForType = this._player.getTracksFor(type);
            if (tracksForType && tracksForType.length > 0) {
                let currentTrack = this._player.getCurrentTrackFor(type);
                let quality = this._player.getQualityFor(type);
                tracks[type] = new TrackView({
                    periodId: currentTrack.streamInfo.index,
                    adaptationSetId: currentTrack.index,
                    representationId: quality
                });
            }
        }
        return tracks;
    }
}

export default ManifestHelper;
