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

        const requestModifier = config.requestModifier;
        const metricsModel = config.metricsModel;

        let instance,
            srLoader,
            _abort;

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

            const headers = _getHeadersForRequest(request);
            const segmentView = _getSegmentViewForRequest(request);
            const srRequest = _getSRRequest(request, headers);

            const requestStartDate = new Date();
            let lastTraceDate = requestStartDate;
            let isFirstProgress = true;
            const traces = [];
            let lastTraceReceivedCount = 0;

            const sendHttpRequestMetric = function(isSuccess, responseCode) {

                request.requestStartDate = requestStartDate;
                request.firstByteDate = request.firstByteDate || requestStartDate;
                request.requestEndDate = new Date();

                metricsModel.addHttpRequest(
                    request.mediaType, //mediaType
                    null, //tcpId
                    request.type, //type
                    request.url, //url
                    null, //actualUrl
                    request.serviceLocation || null, //serviceLocation
                    request.range || null, //range
                    request.requestStartDate, //tRequest
                    request.firstByteDate, //tResponce
                    request.requestEndDate, //tFinish
                    responseCode, //responseCode
                    request.duration, //mediaDuration
                    null, //responseHeaders
                    isSuccess ? traces : null //traces
                );
            }

            const onSuccess = function(segmentData, stats) {

                sendHttpRequestMetric(true, 200);

                eventBus.trigger(Events.LOADING_COMPLETED, {
                    request: request,
                    response: segmentData,
                    sender: parent
                });
            };

            const onProgress = function(stats) {

                let currentDate = new Date();

                if (isFirstProgress) {
                    isFirstProgress = false;
                    request.firstByteDate = currentDate;
                }

                let bytesReceived = 0;
                if (stats.cdnDownloaded) {
                    bytesReceived += stats.cdnDownloaded;
                }
                if (stats.p2pDownloaded) {
                    bytesReceived += stats.p2pDownloaded;
                }

                traces.push({
                    s: lastTraceDate,
                    d: currentDate.getTime() - lastTraceDate.getTime(),
                    b: [bytesReceived ? bytesReceived - lastTraceReceivedCount : 0]
                });

                lastTraceDate = currentDate;
                lastTraceReceivedCount = bytesReceived;

                eventBus.trigger(Events.LOADING_PROGRESS, {
                    request: request
                });
            };

            const onError = function(xhrEvent) {

                sendHttpRequestMetric(false, xhrEvent.target.status);

                eventBus.trigger(Events.LOADING_COMPLETED, {
                    request: undefined,
                    error: new Error(
                        FRAGMENT_LOADER_ERROR_LOADING_FAILURE,
                        "failed loading fragment"
                    )
                });
            };

            _abort = srLoader.getSegment(
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
            if (_abort) {
                _abort();
            }
        }

        function reset() {
            abort();
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
