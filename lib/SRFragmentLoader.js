import EventBus from '../node_modules/dashjs/src/core/EventBus.js';
import Events from '../node_modules/dashjs/src/core/events/Events.js';

import SegmentView from './SegmentView';
import TrackView from './TrackView';

const FRAGMENT_LOADER_ERROR_LOADING_FAILURE = 1;
const FRAGMENT_LOADER_ERROR_NULL_REQUEST = 2;
const FRAGMENT_LOADER_MESSAGE_NULL_REQUEST = 'request is null';

function SRFragmentLoader(config) {
    const context = this.context;
    const factory = this.factory;
    const parent = this.parent;
    const eventBus = factory.getSingletonInstance(context, "EventBus");

    let requestModifier = config.requestModifier;

    let instance,
        srLoader;

    function setup() {
        if (!window.streamrootDownloader) {
            throw new Error("streamrootDownloader is not defined")
        }

        srLoader = window.streamrootDownloader;
    }

    function _getSegmentViewForRequest(request) {
        if (request.type !== "InitializationSegment") {
            let trackView = new TrackView({
                periodId: request.mediaInfo.streamInfo.index,
                adaptationSetId: request.mediaInfo.index,
                representationId: request.quality
            });

            return new SegmentView({
                trackView,
                segmentId: Math.round(request.startTime * 10) //TODO: extract this to SegmentView static method
            });
        }

        return null;
    }

    function _getHeadersForRequest(request) {
        let headers = [];
        if (request.range) {
            headers.push(["Range", 'bytes=' + request.range]);
        }

        return headers;
    }

    function _getSRRequest(request, headers) {
        return {
            url: requestModifier.modifyRequestURL(request.url),
            headers
        }
    }

    function load(request) {

        if (!request) {
            eventBus.trigger(Events.LOADING_COMPLETED, {
                request: undefined,
                error: new Error(
                    FRAGMENT_LOADER_ERROR_NULL_REQUEST,
                    FRAGMENT_LOADER_MESSAGE_NULL_REQUEST
                )
            });

            return;
        }

        let headers = _getHeadersForRequest(request);
        let segmentView = _getSegmentViewForRequest(request);
        let srRequest = _getSRRequest(request, headers);

        let onSuccess = function(segmentData) {
            eventBus.trigger(Events.LOADING_COMPLETED, {
                request: request,
                response: segmentData,
                sender: parent
            });
        };

        let onProgress = function() {
            eventBus.trigger(Events.LOADING_PROGRESS, {
                request: request
            });
        };

        let onError = function() {
            eventBus.trigger(Events.LOADING_COMPLETED, {
                request: undefined,
                error: new Error(
                    FRAGMENT_LOADER_ERROR_LOADING_FAILURE,
                    "failed loading fragment"
                )
            });
        };

        srLoader.getSegment(
            srRequest,
            {
                onSuccess,
                onProgress,
                onError
            },
            segmentView
        );
    }

    function abort() {
    }

    function reset() {
    }

    instance = {
        load: load,
        abort: abort,
        reset: reset
    };

    setup();

    return instance;
}

export default SRFragmentLoader;
