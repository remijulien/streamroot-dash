(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.DashjsWrapper = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ManifestHelper = require('./ManifestHelper');

var _ManifestHelper2 = _interopRequireDefault(_ManifestHelper);

var _MediaMap = require('./MediaMap');

var _MediaMap2 = _interopRequireDefault(_MediaMap);

var _SegmentView = require('./SegmentView');

var _SegmentView2 = _interopRequireDefault(_SegmentView);

var _SRFragmentLoader = require('./SRFragmentLoader');

var _SRFragmentLoader2 = _interopRequireDefault(_SRFragmentLoader);

var _PlayerInterface = require('./PlayerInterface');

var _PlayerInterface2 = _interopRequireDefault(_PlayerInterface);

var DashjsWrapper = (function () {
    function DashjsWrapper(player, videoElement, p2pConfig, liveDelay) {
        _classCallCheck(this, DashjsWrapper);

        this._player = player;
        this._videoElement = videoElement;
        this._p2pConfig = p2pConfig;
        this._liveDelay = liveDelay;

        this._player.setLiveDelay(liveDelay);

        this._player.on(dashjs.MediaPlayer.events.MANIFEST_LOADED, this._onManifestLoaded, this);
    }

    _createClass(DashjsWrapper, [{
        key: '_onManifestLoaded',
        value: function _onManifestLoaded(_ref) {
            var data = _ref.data;

            if (!data) {
                return; // event fires twice when manifest is changed, first time the data is null
            }

            //TODO: we don't know if this event may fire on live streams with same manifest url. if it doesn't, we should remove this check
            if (this._manifest && data.url === this._manifest.url) {
                return;
            }

            this._manifest = data;

            if (window.streamrootDownloader) {
                window.streamrootDownloader.dispose();
            }

            var manifestHelper = new _ManifestHelper2['default'](this._player, this._manifest);
            var playerInterface = new _PlayerInterface2['default'](this._player, manifestHelper, this._liveDelay);
            var mediaMap = new _MediaMap2['default'](manifestHelper);

            // TODO: Remove this global definition
            window.streamrootDownloader = new window.Streamroot.Downloader(playerInterface, this._manifest.url, mediaMap, this._p2pConfig, _SegmentView2['default'], this._videoElement);

            this._player.extend("FragmentLoader", _SRFragmentLoader2['default'], true);
        }
    }]);

    return DashjsWrapper;
})();

exports['default'] = DashjsWrapper;
module.exports = exports['default'];

},{"./ManifestHelper":2,"./MediaMap":3,"./PlayerInterface":4,"./SRFragmentLoader":5,"./SegmentView":6}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _TrackView = require('./TrackView');

var _TrackView2 = _interopRequireDefault(_TrackView);

var _node_modulesDashjsSrcDashUtilsSegmentsGetter = require('../node_modules/dashjs/src/dash/utils/SegmentsGetter');

var _node_modulesDashjsSrcDashUtilsSegmentsGetter2 = _interopRequireDefault(_node_modulesDashjsSrcDashUtilsSegmentsGetter);

var _SegmentsCache = require('./SegmentsCache');

var _SegmentsCache2 = _interopRequireDefault(_SegmentsCache);

var ManifestHelper = (function () {
    function ManifestHelper(player, manifest) {
        _classCallCheck(this, ManifestHelper);

        this._player = player;
        this._manifest = manifest;
        this._segmentsCache = new _SegmentsCache2['default'](player);

        var getConfig = undefined,
            getContext = undefined,
            getDashManifestModel = undefined,
            getTimelineConverter = undefined;

        function StreamSR(config) {

            var factory = this.factory,
                context = this.context;

            getConfig = function () {
                return config;
            };

            getContext = function () {
                return context;
            };

            getDashManifestModel = function () {
                return factory.getSingletonInstance(context, "DashManifestModel");
            };

            getTimelineConverter = function () {
                return config.timelineConverter;
            };
        }

        player.extend("Stream", StreamSR, true);

        this._getDashManifestModel = function () {
            return getDashManifestModel ? getDashManifestModel() : undefined;
        };

        this._getTimelineConverter = function () {
            return getTimelineConverter ? getTimelineConverter() : undefined;
        };

        this._getConfig = function () {
            return getConfig();
        };

        this._getContext = function () {
            return getContext();
        };

        this._getSegmentsGetter = function () {
            if (!this._segmentsGetter) {
                var context = this._getContext();
                var config = this._getConfig();

                this._segmentsGetter = (0, _node_modulesDashjsSrcDashUtilsSegmentsGetter2['default'])(context).create(config, this.isLive());
            }

            return this._segmentsGetter;
        };
    }

    _createClass(ManifestHelper, [{
        key: 'getSegmentList',
        value: function getSegmentList(trackView) {

            if (this._segmentsCache.hasSegments(trackView)) {
                return this._segmentsCache.getSegments(trackView);
            }

            var dashManifestModel = this._getDashManifestModel(),
                timelineConverter = this._getTimelineConverter();

            if (!dashManifestModel || !timelineConverter) throw new Error("Tried to get representation before we could have access to dash.js manifest internals");

            var mpd = dashManifestModel.getMpd(this._manifest);
            var period = dashManifestModel.getRegularPeriods(this._manifest, mpd)[trackView.periodId];
            var adaptation = dashManifestModel.getAdaptationsForPeriod(this._manifest, period)[trackView.adaptationSetId];
            var representation = dashManifestModel.getRepresentationsForAdaptation(this._manifest, adaptation)[trackView.representationId];
            var isDynamic = this.isLive();

            representation.segmentAvailabilityRange = timelineConverter.calcSegmentAvailabilityRange(representation, isDynamic);
            var segments = this._getSegmentsGetter().getSegments(representation, 0, 0, undefined, 1000000);

            return segments;
        }
    }, {
        key: 'isLive',
        value: function isLive() {
            var dashManifestModel = this._getDashManifestModel();

            if (!dashManifestModel) throw new Error("Tried to get representation before we could have access to dash.js manifest internals");

            return dashManifestModel.getIsDynamic(this._manifest);
        }
    }, {
        key: 'getCurrentTracks',
        value: function getCurrentTracks() {
            var tracks = {};
            var _arr = ["audio", "video"];
            for (var _i = 0; _i < _arr.length; _i++) {
                var type = _arr[_i];
                var tracksForType = this._player.getTracksFor(type);
                if (tracksForType && tracksForType.length > 0) {
                    var currentTrack = this._player.getCurrentTrackFor(type);
                    var quality = this._player.getQualityFor(type);
                    tracks[type] = new _TrackView2['default']({
                        periodId: currentTrack.streamInfo.index,
                        adaptationSetId: currentTrack.index,
                        representationId: quality
                    });
                }
            }
            return tracks;
        }
    }, {
        key: 'getAllTracks',
        value: function getAllTracks() {
            var tracks = {};

            var periods = this._player.getStreamsFromManifest(this._manifest);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = periods[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var period = _step.value;
                    var _arr2 = ["audio", "video"];

                    for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
                        var type = _arr2[_i2];

                        tracks[type] = [];

                        var adaptationSets = this._player.getTracksForTypeFromManifest(type, this._manifest, period);
                        if (!adaptationSets) {
                            continue;
                        }

                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = adaptationSets[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var adaptationSet = _step2.value;

                                for (var i = 0; i < adaptationSet.representationCount; i++) {
                                    tracks[type].push(new _TrackView2['default']({
                                        periodId: period.index,
                                        adaptationSetId: adaptationSet.index,
                                        representationId: i
                                    }));
                                }
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                                    _iterator2['return']();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator['return']) {
                        _iterator['return']();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return tracks;
        }
    }]);

    return ManifestHelper;
})();

exports['default'] = ManifestHelper;
module.exports = exports['default'];

},{"../node_modules/dashjs/src/dash/utils/SegmentsGetter":15,"./SegmentsCache":7,"./TrackView":8}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _SegmentView = require('./SegmentView');

var _SegmentView2 = _interopRequireDefault(_SegmentView);

var _TrackView = require('./TrackView');

var _TrackView2 = _interopRequireDefault(_TrackView);

var MediaMap = (function () {
    function MediaMap(manifestHelper) {
        _classCallCheck(this, MediaMap);

        this._manifestHelper = manifestHelper;
    }

    /**
     *
     * @returns boolean
     */

    _createClass(MediaMap, [{
        key: 'isLive',
        value: function isLive() {
            return this._manifestHelper.isLive();
        }

        /**
        * @param segmentView {SegmentView}
        * @returns number   (:warning: time must be in second if we want the debug tool (buffer display) to work properly)
        */
    }, {
        key: 'getSegmentTime',
        value: function getSegmentTime(segmentView) {
            return segmentView.segmentId / 10; //TODO: should not it be a static method of SegmentView?
        }

        /**
        * @param trackView {TrackView}
        * @param beginTime {number}
        * @param duration {number}
        * @returns [SegmentView]
        */

    }, {
        key: 'getSegmentList',
        value: function getSegmentList(trackView, beginTime, duration) {

            var dashjsSegmentList = this._manifestHelper.getSegmentList(trackView);

            var segmentList = [],
                segmentView = undefined;

            if (dashjsSegmentList === undefined) {
                return segmentList;
            }

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = dashjsSegmentList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var segment = _step.value;

                    var startTime = segment.mediaStartTime || segment.startTime;
                    if (segment.timescale) {
                        startTime = startTime / segment.timescale;
                    }

                    if (beginTime <= startTime && startTime <= beginTime + duration) {
                        segmentView = new _SegmentView2['default']({
                            trackView: trackView,
                            segmentId: Math.round(startTime * 10) //TODO: make this static method of SegmentView
                        });
                        segmentList.push(segmentView);
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator['return']) {
                        _iterator['return']();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return segmentList;
        }
    }, {
        key: 'getNextSegmentView',
        value: function getNextSegmentView(segmentView) {
            var beginTime = this.getSegmentTime(segmentView) + 0.2;
            // +0.2 will give us a beginTime just after the beginning of the segmentView, so we know it won't be included in the following getSegmentList (condition includes beginTime <= segment.mediaStartTime)

            var segmentList = this.getSegmentList(segmentView.trackView, beginTime, 30);
            return segmentList.length ? segmentList[0] : null;
        }
    }, {
        key: 'getTracksList',
        value: function getTracksList() {
            var tracks = this._manifestHelper.getAllTracks(),
                trackArray = [];

            // Kind of sucks that we don't expect the same format than in onTrackChange
            var _arr = ["audio", "video"];
            for (var _i = 0; _i < _arr.length; _i++) {
                var type = _arr[_i];
                if (tracks[type]) {
                    trackArray.push.apply(trackArray, _toConsumableArray(tracks[type]));
                }
            }

            return trackArray;
        }
    }]);

    return MediaMap;
})();

exports['default'] = MediaMap;
module.exports = exports['default'];

},{"./SegmentView":6,"./TrackView":8}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _TrackView = require('./TrackView');

var _TrackView2 = _interopRequireDefault(_TrackView);

var PlayerInterface = (function () {
    function PlayerInterface(player, manifestHelper, liveDelay) {
        _classCallCheck(this, PlayerInterface);

        this._player = player;
        this._manifestHelper = manifestHelper;
        this._liveDelay = liveDelay;

        this.MIN_BUFFER_LEVEL = 10;

        this._listeners = new Map();

        this._onStreamInitialized = this._dispatchInitialOnTrackChange.bind(this);
        this._player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, this._onStreamInitialized);
    }

    _createClass(PlayerInterface, [{
        key: "isLive",
        value: function isLive() {
            return this._manifestHelper.isLive();
        }
    }, {
        key: "getBufferLevelMax",
        value: function getBufferLevelMax() {
            return Math.max(0, this._liveDelay - this.MIN_BUFFER_LEVEL);
        }
    }, {
        key: "setBufferMarginLive",
        value: function setBufferMarginLive(bufferLevel) {
            this._player.setStableBufferTime(this.MIN_BUFFER_LEVEL + bufferLevel);
            this._player.setBufferTimeAtTopQuality(this.MIN_BUFFER_LEVEL + bufferLevel);
            this._player.setBufferTimeAtTopQualityLongForm(this.MIN_BUFFER_LEVEL + bufferLevel); // TODO: can live be "long form" ?
        }
    }, {
        key: "addEventListener",
        value: function addEventListener(eventName, observer) {
            if (eventName !== "onTrackChange") {
                console.error("Tried to listen to an event that wasn't onTrackChange");
                return; // IMPORTANT: we need to return to avoid errors in _dispatchInitialOnTrackChange
            }

            var onTrackChangeListener = this._createOnTrackChangeListener(observer);
            this._listeners.set(observer, onTrackChangeListener);

            this._player.on('qualityChanged', onTrackChangeListener); //TODO: hardcoded event name. Get it from enum
        }
    }, {
        key: "removeEventListener",
        value: function removeEventListener(eventName, observer) {
            if (eventName !== "onTrackChange") {
                console.error("Tried to remove listener for an event that wasn't onTrackChange");
                return;
            }

            var onTrackChangeListener = this._listeners.get(observer);

            this._player.off('qualityChanged', onTrackChangeListener); //TODO: hardcoded event name. Get it from enum

            this._listeners["delete"](observer);
        }
    }, {
        key: "_createOnTrackChangeListener",
        value: function _createOnTrackChangeListener(observer) {
            var player = this._player;

            return function (_ref) {
                var mediaType = _ref.mediaType;
                var streamInfo = _ref.streamInfo;
                var oldQuality = _ref.oldQuality;
                var newQuality = _ref.newQuality;

                var tracks = {};
                tracks[mediaType] = new _TrackView2["default"]({
                    periodId: streamInfo.index,
                    adaptationSetId: player.getCurrentTrackFor(mediaType).index,
                    representationId: Number(newQuality)
                });

                observer(tracks);
            };
        }
    }, {
        key: "_dispatchInitialOnTrackChange",
        value: function _dispatchInitialOnTrackChange() {
            var tracks = this._manifestHelper.getCurrentTracks();

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._listeners[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _step$value = _toArray(_step.value);

                    var observer = _step$value[0];

                    var rest = _step$value.slice(1);

                    observer(tracks);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator["return"]) {
                        _iterator["return"]();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    }]);

    return PlayerInterface;
})();

exports["default"] = PlayerInterface;
module.exports = exports["default"];

},{"./TrackView":8}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _node_modulesDashjsSrcCoreEventBusJs = require('../node_modules/dashjs/src/core/EventBus.js');

var _node_modulesDashjsSrcCoreEventBusJs2 = _interopRequireDefault(_node_modulesDashjsSrcCoreEventBusJs);

var _node_modulesDashjsSrcCoreEventsEventsJs = require('../node_modules/dashjs/src/core/events/Events.js');

var _node_modulesDashjsSrcCoreEventsEventsJs2 = _interopRequireDefault(_node_modulesDashjsSrcCoreEventsEventsJs);

var _SegmentView = require('./SegmentView');

var _SegmentView2 = _interopRequireDefault(_SegmentView);

var _TrackView = require('./TrackView');

var _TrackView2 = _interopRequireDefault(_TrackView);

var FRAGMENT_LOADER_ERROR_LOADING_FAILURE = 1;
var FRAGMENT_LOADER_ERROR_NULL_REQUEST = 2;
var FRAGMENT_LOADER_MESSAGE_NULL_REQUEST = 'request is null';

function SRFragmentLoader(config) {
    var context = this.context;
    var factory = this.factory;
    var parent = this.parent;
    var eventBus = factory.getSingletonInstance(context, "EventBus");

    var requestModifier = config.requestModifier;
    var metricsModel = config.metricsModel;

    var instance = undefined,
        srLoader = undefined,
        _abort = undefined;

    function setup() {
        if (!window.streamrootDownloader) {
            throw new Error("streamrootDownloader is not defined");
        }

        srLoader = window.streamrootDownloader;
    }

    function _getSegmentViewForRequest(request) {
        if (request.type !== "InitializationSegment") {
            var trackView = new _TrackView2['default']({
                periodId: request.mediaInfo.streamInfo.index,
                adaptationSetId: request.mediaInfo.index,
                representationId: request.quality
            });

            return new _SegmentView2['default']({
                trackView: trackView,
                segmentId: Math.round(request.startTime * 10) //TODO: extract this to SegmentView static method
            });
        }

        return null;
    }

    function _getHeadersForRequest(request) {
        var headers = [];
        if (request.range) {
            headers.push(["Range", 'bytes=' + request.range]);
        }

        return headers;
    }

    function _getSRRequest(request, headers) {
        return {
            url: requestModifier.modifyRequestURL(request.url),
            headers: headers
        };
    }

    function load(request) {

        if (!request) {
            eventBus.trigger(_node_modulesDashjsSrcCoreEventsEventsJs2['default'].LOADING_COMPLETED, {
                request: undefined,
                error: new Error(FRAGMENT_LOADER_ERROR_NULL_REQUEST, FRAGMENT_LOADER_MESSAGE_NULL_REQUEST)
            });

            return;
        }

        var headers = _getHeadersForRequest(request);
        var segmentView = _getSegmentViewForRequest(request);
        var srRequest = _getSRRequest(request, headers);

        var requestStartDate = new Date();
        var lastTraceDate = requestStartDate;
        var isFirstProgress = true;
        var traces = [];
        var lastTraceReceivedCount = 0;

        var sendHttpRequestMetric = function sendHttpRequestMetric(isSuccess, responseCode) {

            request.requestStartDate = requestStartDate;
            request.firstByteDate = request.firstByteDate || requestStartDate;
            request.requestEndDate = new Date();

            metricsModel.addHttpRequest(request.mediaType, //mediaType
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
        };

        var onSuccess = function onSuccess(segmentData, stats) {

            sendHttpRequestMetric(true, 200);

            eventBus.trigger(_node_modulesDashjsSrcCoreEventsEventsJs2['default'].LOADING_COMPLETED, {
                request: request,
                response: segmentData,
                sender: parent
            });
        };

        var onProgress = function onProgress(stats) {

            var currentDate = new Date();

            if (isFirstProgress) {
                isFirstProgress = false;
                request.firstByteDate = currentDate;
            }

            var bytesReceived = 0;
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

            eventBus.trigger(_node_modulesDashjsSrcCoreEventsEventsJs2['default'].LOADING_PROGRESS, {
                request: request
            });
        };

        var onError = function onError(xhrEvent) {

            sendHttpRequestMetric(false, xhrEvent.target.status);

            eventBus.trigger(_node_modulesDashjsSrcCoreEventsEventsJs2['default'].LOADING_COMPLETED, {
                request: undefined,
                error: new Error(FRAGMENT_LOADER_ERROR_LOADING_FAILURE, "failed loading fragment")
            });
        };

        _abort = srLoader.getSegment(srRequest, {
            onSuccess: onSuccess,
            onProgress: onProgress,
            onError: onError
        }, segmentView);
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

exports['default'] = SRFragmentLoader;
module.exports = exports['default'];

},{"../node_modules/dashjs/src/core/EventBus.js":9,"../node_modules/dashjs/src/core/events/Events.js":12,"./SegmentView":6,"./TrackView":8}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _TrackView = require('./TrackView');

var _TrackView2 = _interopRequireDefault(_TrackView);

var SegmentView = (function () {
  _createClass(SegmentView, null, [{
    key: 'fromArrayBuffer',

    /**
    * @param arrayBuffer {ArrayBuffer}
    * @returns {SegmentView}
    */
    value: function fromArrayBuffer(arrayBuffer) {
      var u32Data = new Uint32Array(arrayBuffer);

      var _u32Data = _slicedToArray(u32Data, 4);

      var periodId = _u32Data[0];
      var adaptationSetId = _u32Data[1];
      var representationId = _u32Data[2];
      var segmentId = _u32Data[3];

      return new SegmentView({
        trackView: new _TrackView2['default']({ periodId: periodId, adaptationSetId: adaptationSetId, representationId: representationId }),
        segmentId: segmentId
      });
    }

    /**
      * @param {Object} object
      */
  }]);

  function SegmentView(obj) {
    _classCallCheck(this, SegmentView);

    this.segmentId = obj.segmentId;
    this.trackView = new _TrackView2['default'](obj.trackView);
  }

  /**
    * Determines if a segment represent the same media chunk than another segment
    * @param segmentView {SegmentView}
    * @returns {boolean}
    */

  _createClass(SegmentView, [{
    key: 'isEqual',
    value: function isEqual(segmentView) {
      if (!segmentView) {
        return false;
      }
      var segmentId = segmentView.segmentId;
      var trackView = segmentView.trackView;

      return this.segmentId === segmentId && this.trackView.isEqual(trackView);
    }

    /**
      * @param trackView {TrackView}
      * @returns {boolean}
      */
  }, {
    key: 'isInTrack',
    value: function isInTrack(trackView) {
      return this.trackView.isEqual(trackView);
    }

    /**
      * @returns {String}
      */
  }, {
    key: 'viewToString',
    value: function viewToString() {
      return this.trackView.viewToString() + 'S' + this.segmentId;
    }

    /**
      * @returns {ArrayBuffer}
      */
  }, {
    key: 'toArrayBuffer',
    value: function toArrayBuffer() {
      return new Uint32Array([this.trackView.periodId, this.trackView.adaptationSetId, this.trackView.representationId, this.segmentId]).buffer;
    }
  }]);

  return SegmentView;
})();

exports['default'] = SegmentView;
module.exports = exports['default'];

},{"./TrackView":8}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _TrackView = require('./TrackView');

var _TrackView2 = _interopRequireDefault(_TrackView);

var SegmentsCache = (function () {
    function SegmentsCache(player) {
        _classCallCheck(this, SegmentsCache);

        this._player = player;
        this._player.on('segmentsLoaded', this._onSegmentsLoaded, this);

        //TODO: check if cache should be flushed on player's 'representationUpdated' event
        this._cache = {};
    }

    _createClass(SegmentsCache, [{
        key: '_onSegmentsLoaded',
        value: function _onSegmentsLoaded(event) {
            var segments = event.segments;
            var trackViewId = _TrackView2['default'].makeIDString(event.representation.adaptation.period.index, event.representation.adaptation.index, event.representation.index);

            this._cache[trackViewId] = segments;
        }
    }, {
        key: 'hasSegments',
        value: function hasSegments(trackView) {
            return this._cache[trackView.viewToString()] !== undefined;
        }
    }, {
        key: 'getSegments',
        value: function getSegments(trackView) {
            return this._cache[trackView.viewToString()];
        }
    }]);

    return SegmentsCache;
})();

exports['default'] = SegmentsCache;
module.exports = exports['default'];

},{"./TrackView":8}],8:[function(require,module,exports){
//jshint -W098
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TrackView = (function () {
  function TrackView(obj) {
    _classCallCheck(this, TrackView);

    this.periodId = obj.periodId;
    this.adaptationSetId = obj.adaptationSetId;
    this.representationId = obj.representationId;
  }

  _createClass(TrackView, [{
    key: "viewToString",

    /**
      * @returns {String}
      */
    value: function viewToString() {
      return TrackView.makeIDString(this.periodId, this.adaptationSetId, this.representationId);
    }

    /**
      * @param trackView {TrackView}
      * @returns {boolean}
      */
  }, {
    key: "isEqual",
    value: function isEqual(trackView) {
      return !!trackView && this.periodId === trackView.periodId && this.adaptationSetId === trackView.adaptationSetId && this.representationId === trackView.representationId;
    }
  }], [{
    key: "makeIDString",
    value: function makeIDString(periodId, adaptationSetId, representationId) {
      return "P" + periodId + "A" + adaptationSetId + "R" + representationId;
    }
  }]);

  return TrackView;
})();

exports["default"] = TrackView;
module.exports = exports["default"];

},{}],9:[function(require,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _FactoryMakerJs = require('./FactoryMaker.js');

var _FactoryMakerJs2 = _interopRequireDefault(_FactoryMakerJs);

function EventBus() {

    var instance = undefined;
    var handlers = {};

    function on(type, listener, scope) {
        if (!type) {
            throw new Error('event type cannot be null or undefined');
        }

        if (!listener || typeof listener !== 'function') {
            throw new Error('listener must be a function: ' + listener);
        }

        if (getHandlerIdx(type, listener, scope) >= 0) return;

        var handler = {
            callback: listener,
            scope: scope
        };

        handlers[type] = handlers[type] || [];
        handlers[type].push(handler);
    }

    function off(type, listener, scope) {
        if (!type || !listener || !handlers[type]) return;

        var idx = getHandlerIdx(type, listener, scope);

        if (idx < 0) return;

        handlers[type].splice(idx, 1);
    }

    function trigger(type, args) {
        if (!type || !handlers[type]) return;

        args = args || {};

        if (args.hasOwnProperty('type')) {
            throw new Error('\'type\' is a reserved word for event dispatching');
        }

        args.type = type;

        handlers[type].forEach(function (handler) {
            handler.callback.call(handler.scope, args);
        });
    }

    function reset() {
        handlers = {};
    }

    function getHandlerIdx(type, listener, scope) {
        var handlersForType = handlers[type];
        var result = -1;

        if (!handlersForType || handlersForType.length === 0) return result;

        for (var i = 0; i < handlersForType.length; i++) {
            if (handlersForType[i].callback === listener && (!scope || scope === handlersForType[i].scope)) return i;
        }

        return result;
    }

    instance = {
        on: on,
        off: off,
        trigger: trigger,
        reset: reset
    };

    return instance;
}

EventBus.__dashjs_factory_name = 'EventBus';
exports['default'] = _FactoryMakerJs2['default'].getSingletonFactory(EventBus);
module.exports = exports['default'];

},{"./FactoryMaker.js":10}],10:[function(require,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * @Module FactoryMaker
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var FactoryMaker = (function () {

    var instance = undefined;
    var extensions = [];
    var singletonContexts = [];

    function extend(name, childInstance, override, context) {
        var extensionContext = getExtensionContext(context);
        if (!extensionContext[name] && childInstance) {
            extensionContext[name] = { instance: childInstance, override: override };
        }
    }

    /**
     * Use this method from your extended object.  this.factory is injected into your object.
     * this.factory.getSingletonInstance(this.context, 'VideoModel')
     * will return the video model for use in the extended object.
     *
     * @param context {Object} injected into extended object as this.context
     * @param className {String} string name found in all dash.js objects
     * with name __dashjs_factory_name Will be at the bottom. Will be the same as the object's name.
     * @returns {*} Context aware instance of specified singleton name.
     * @memberof module:FactoryMaker
     * @instance
     */
    function getSingletonInstance(context, className) {
        for (var i in singletonContexts) {
            var obj = singletonContexts[i];
            if (obj.context === context && obj.name === className) {
                return obj.instance;
            }
        }
        return null;
    }

    /**
     * Use this method to add an singleton instance to the system.  Useful for unit testing to mock objects etc.
     *
     * @param context
     * @param className
     * @param instance
     * @memberof module:FactoryMaker
     * @instance
     */
    function setSingletonInstance(context, className, instance) {
        for (var i in singletonContexts) {
            var obj = singletonContexts[i];
            if (obj.context === context && obj.name === className) {
                singletonContexts[i].instance = instance;
                return;
            }
        }
        singletonContexts.push({ name: className, context: context, instance: instance });
    }

    function getClassFactory(classConstructor) {
        return function (context) {
            if (context === undefined) {
                context = {};
            }
            return {
                create: function create() {
                    return merge(classConstructor.__dashjs_factory_name, classConstructor.apply({ context: context }, arguments), context, arguments);
                }
            };
        };
    }

    function getSingletonFactory(classConstructor) {
        return function (context) {
            var instance = undefined;
            if (context === undefined) {
                context = {};
            }
            return {
                getInstance: function getInstance() {
                    // If we don't have an instance yet check for one on the context
                    if (!instance) {
                        instance = getSingletonInstance(context, classConstructor.__dashjs_factory_name);
                    }
                    // If there's no instance on the context then create one
                    if (!instance) {
                        instance = merge(classConstructor.__dashjs_factory_name, classConstructor.apply({ context: context }, arguments), context, arguments);
                        singletonContexts.push({ name: classConstructor.__dashjs_factory_name, context: context, instance: instance });
                    }
                    return instance;
                }
            };
        };
    }

    function merge(name, classConstructor, context, args) {
        var extensionContext = getExtensionContext(context);
        var extensionObject = extensionContext[name];
        if (extensionObject) {
            var extension = extensionObject.instance;
            if (extensionObject.override) {
                //Override public methods in parent but keep parent.
                extension = extension.apply({ context: context, factory: instance, parent: classConstructor }, args);
                for (var prop in extension) {
                    if (classConstructor.hasOwnProperty(prop)) {
                        classConstructor[prop] = extension[prop];
                    }
                }
            } else {
                //replace parent object completely with new object. Same as dijon.
                return extension.apply({ context: context, factory: instance }, args);
            }
        }
        return classConstructor;
    }

    function getExtensionContext(context) {
        var extensionContext = undefined;
        extensions.forEach(function (obj) {
            if (obj === context) {
                extensionContext = obj;
            }
        });
        if (!extensionContext) {
            extensionContext = extensions.push(context);
        }
        return extensionContext;
    }

    instance = {
        extend: extend,
        getSingletonInstance: getSingletonInstance,
        setSingletonInstance: setSingletonInstance,
        getSingletonFactory: getSingletonFactory,
        getClassFactory: getClassFactory
    };

    return instance;
})();

exports["default"] = FactoryMaker;
module.exports = exports["default"];

},{}],11:[function(require,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _EventsBaseJs = require('./EventsBase.js');

var _EventsBaseJs2 = _interopRequireDefault(_EventsBaseJs);

/**
 * @class
 * @ignore
 */

var CoreEvents = (function (_EventsBase) {
    _inherits(CoreEvents, _EventsBase);

    function CoreEvents() {
        _classCallCheck(this, CoreEvents);

        _get(Object.getPrototypeOf(CoreEvents.prototype), 'constructor', this).call(this);
        this.AST_IN_FUTURE = 'astinfuture';
        this.BUFFERING_COMPLETED = 'bufferingCompleted';
        this.BUFFER_CLEARED = 'bufferCleared';
        this.BUFFER_LEVEL_STATE_CHANGED = 'bufferStateChanged';
        this.BUFFER_LEVEL_UPDATED = 'bufferLevelUpdated';
        this.BYTES_APPENDED = 'bytesAppended';
        this.CHECK_FOR_EXISTENCE_COMPLETED = 'checkForExistenceCompleted';
        this.CHUNK_APPENDED = 'chunkAppended';
        this.CURRENT_TRACK_CHANGED = 'currenttrackchanged';
        this.DATA_UPDATE_COMPLETED = 'dataUpdateCompleted';
        this.DATA_UPDATE_STARTED = 'dataUpdateStarted';
        this.FRAGMENT_LOADING_COMPLETED = 'fragmentLoadingCompleted';
        this.FRAGMENT_LOADING_STARTED = 'fragmentLoadingStarted';
        this.INITIALIZATION_LOADED = 'initializationLoaded';
        this.INIT_FRAGMENT_LOADED = 'initFragmentLoaded';
        this.INIT_REQUESTED = 'initRequested';
        this.INTERNAL_MANIFEST_LOADED = 'internalManifestLoaded';
        this.LIVE_EDGE_SEARCH_COMPLETED = 'liveEdgeSearchCompleted';
        this.LOADING_COMPLETED = 'loadingCompleted';
        this.LOADING_PROGRESS = 'loadingProgress';
        this.MANIFEST_UPDATED = 'manifestUpdated';
        this.MEDIA_FRAGMENT_LOADED = 'mediaFragmentLoaded';
        this.QUALITY_CHANGED = 'qualityChanged';
        this.QUOTA_EXCEEDED = 'quotaExceeded';
        this.REPRESENTATION_UPDATED = 'representationUpdated';
        this.SEGMENTS_LOADED = 'segmentsLoaded';
        this.SOURCEBUFFER_APPEND_COMPLETED = 'sourceBufferAppendCompleted';
        this.SOURCEBUFFER_REMOVE_COMPLETED = 'sourceBufferRemoveCompleted';
        this.STREAMS_COMPOSED = 'streamsComposed';
        this.STREAM_BUFFERING_COMPLETED = 'streamBufferingCompleted';
        this.STREAM_COMPLETED = 'streamCompleted';
        this.STREAM_INITIALIZED = 'streaminitialized';
        this.STREAM_TEARDOWN_COMPLETE = 'streamTeardownComplete';
        this.TIMED_TEXT_REQUESTED = 'timedTextRequested';
        this.TIME_SYNCHRONIZATION_COMPLETED = 'timeSynchronizationComplete';
        this.WALLCLOCK_TIME_UPDATED = 'wallclockTimeUpdated';
        this.XLINK_ALL_ELEMENTS_LOADED = 'xlinkAllElementsLoaded';
        this.XLINK_ELEMENT_LOADED = 'xlinkElementLoaded';
        this.XLINK_READY = 'xlinkReady';
    }

    return CoreEvents;
})(_EventsBaseJs2['default']);

exports['default'] = CoreEvents;
module.exports = exports['default'];

},{"./EventsBase.js":13}],12:[function(require,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * @class
 * @ignore
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _CoreEventsJs = require('./CoreEvents.js');

var _CoreEventsJs2 = _interopRequireDefault(_CoreEventsJs);

var Events = (function (_CoreEvents) {
  _inherits(Events, _CoreEvents);

  function Events() {
    _classCallCheck(this, Events);

    _get(Object.getPrototypeOf(Events.prototype), 'constructor', this).apply(this, arguments);
  }

  return Events;
})(_CoreEventsJs2['default']);

var events = new Events();
exports['default'] = events;
module.exports = exports['default'];

},{"./CoreEvents.js":11}],13:[function(require,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * @class
 * @ignore
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var EventsBase = (function () {
    function EventsBase() {
        _classCallCheck(this, EventsBase);
    }

    _createClass(EventsBase, [{
        key: 'extend',
        value: function extend(events, config) {
            if (!events) return;

            var override = config ? config.override : false;
            var publicOnly = config ? config.publicOnly : false;

            for (var evt in events) {
                if (!events.hasOwnProperty(evt) || this[evt] && !override) continue;
                if (publicOnly && events[evt].indexOf('public_') === -1) continue;
                this[evt] = events[evt];
            }
        }
    }]);

    return EventsBase;
})();

exports['default'] = EventsBase;
module.exports = exports['default'];

},{}],14:[function(require,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _coreFactoryMakerJs = require('../../core/FactoryMaker.js');

var _coreFactoryMakerJs2 = _interopRequireDefault(_coreFactoryMakerJs);

var _SegmentsUtilsJs = require('./SegmentsUtils.js');

function ListSegmentsGetter(config, isDynamic) {

    var timelineConverter = config.timelineConverter;

    var instance = undefined;

    function getSegmentsFromList(representation, requestedTime, index, availabilityUpperLimit) {
        var list = representation.adaptation.period.mpd.manifest.Period_asArray[representation.adaptation.period.index].AdaptationSet_asArray[representation.adaptation.index].Representation_asArray[representation.index].SegmentList;
        var baseURL = representation.adaptation.period.mpd.manifest.Period_asArray[representation.adaptation.period.index].AdaptationSet_asArray[representation.adaptation.index].Representation_asArray[representation.index].BaseURL;
        var len = list.SegmentURL_asArray.length;

        var segments = [];

        var periodSegIdx, seg, s, range, startIdx, endIdx, start;

        start = representation.startNumber;

        range = (0, _SegmentsUtilsJs.decideSegmentListRangeForTemplate)(timelineConverter, isDynamic, representation, requestedTime, index, availabilityUpperLimit);
        startIdx = Math.max(range.start, 0);
        endIdx = Math.min(range.end, list.SegmentURL_asArray.length - 1);

        for (periodSegIdx = startIdx; periodSegIdx <= endIdx; periodSegIdx++) {
            s = list.SegmentURL_asArray[periodSegIdx];

            seg = (0, _SegmentsUtilsJs.getIndexBasedSegment)(timelineConverter, isDynamic, representation, periodSegIdx);
            seg.replacementTime = (start + periodSegIdx - 1) * representation.segmentDuration;
            seg.media = s.media ? s.media : baseURL;
            seg.mediaRange = s.mediaRange;
            seg.index = s.index;
            seg.indexRange = s.indexRange;

            segments.push(seg);
            seg = null;
        }

        representation.availableSegmentsNumber = len;

        return segments;
    }

    instance = {
        getSegments: getSegmentsFromList
    };

    return instance;
}

ListSegmentsGetter.__dashjs_factory_name = 'ListSegmentsGetter';
var factory = _coreFactoryMakerJs2['default'].getClassFactory(ListSegmentsGetter);
exports['default'] = factory;
module.exports = exports['default'];

},{"../../core/FactoryMaker.js":10,"./SegmentsUtils.js":16}],15:[function(require,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _coreFactoryMakerJs = require('../../core/FactoryMaker.js');

var _coreFactoryMakerJs2 = _interopRequireDefault(_coreFactoryMakerJs);

var _TimelineSegmentsGetterJs = require('./TimelineSegmentsGetter.js');

var _TimelineSegmentsGetterJs2 = _interopRequireDefault(_TimelineSegmentsGetterJs);

var _TemplateSegmentsGetterJs = require('./TemplateSegmentsGetter.js');

var _TemplateSegmentsGetterJs2 = _interopRequireDefault(_TemplateSegmentsGetterJs);

var _ListSegmentsGetterJs = require('./ListSegmentsGetter.js');

var _ListSegmentsGetterJs2 = _interopRequireDefault(_ListSegmentsGetterJs);

function SegmentsGetter(config, isDynamic) {

    var context = this.context;

    var instance = undefined,
        timelineSegmentsGetter = undefined,
        templateSegmentsGetter = undefined,
        listSegmentsGetter = undefined;

    function setup() {
        timelineSegmentsGetter = (0, _TimelineSegmentsGetterJs2['default'])(context).create(config, isDynamic);
        templateSegmentsGetter = (0, _TemplateSegmentsGetterJs2['default'])(context).create(config, isDynamic);
        listSegmentsGetter = (0, _ListSegmentsGetterJs2['default'])(context).create(config, isDynamic);
    }

    function getSegments(representation, requestedTime, index, onSegmentListUpdatedCallback, availabilityUpperLimit) {
        var segments;
        var type = representation.segmentInfoType;

        // Already figure out the segments.
        if (type === 'SegmentBase' || type === 'BaseURL' || !isSegmentListUpdateRequired(representation, index)) {
            segments = representation.segments;
        } else {
            if (type === 'SegmentTimeline') {
                segments = timelineSegmentsGetter.getSegments(representation, requestedTime, index, availabilityUpperLimit);
            } else if (type === 'SegmentTemplate') {
                segments = templateSegmentsGetter.getSegments(representation, requestedTime, index, availabilityUpperLimit);
            } else if (type === 'SegmentList') {
                segments = listSegmentsGetter.getSegments(representation, requestedTime, index, availabilityUpperLimit);
            }

            if (onSegmentListUpdatedCallback) {
                onSegmentListUpdatedCallback(representation, segments);
            }
        }

        return segments;
    }

    function isSegmentListUpdateRequired(representation, index) {
        var segments = representation.segments;
        var updateRequired = false;

        var upperIdx, lowerIdx;

        if (!segments || segments.length === 0) {
            updateRequired = true;
        } else {
            lowerIdx = segments[0].availabilityIdx;
            upperIdx = segments[segments.length - 1].availabilityIdx;
            updateRequired = index < lowerIdx || index > upperIdx;
        }

        return updateRequired;
    }

    instance = {
        getSegments: getSegments
    };

    setup();

    return instance;
}

SegmentsGetter.__dashjs_factory_name = 'SegmentsGetter';
var factory = _coreFactoryMakerJs2['default'].getClassFactory(SegmentsGetter);
exports['default'] = factory;
module.exports = exports['default'];

},{"../../core/FactoryMaker.js":10,"./ListSegmentsGetter.js":14,"./TemplateSegmentsGetter.js":17,"./TimelineSegmentsGetter.js":18}],16:[function(require,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.replaceTokenForTemplate = replaceTokenForTemplate;
exports.getIndexBasedSegment = getIndexBasedSegment;
exports.getTimeBasedSegment = getTimeBasedSegment;
exports.getSegmentByIndex = getSegmentByIndex;
exports.decideSegmentListRangeForTimeline = decideSegmentListRangeForTimeline;
exports.decideSegmentListRangeForTemplate = decideSegmentListRangeForTemplate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _voSegmentJs = require('./../vo/Segment.js');

var _voSegmentJs2 = _interopRequireDefault(_voSegmentJs);

function zeroPadToLength(numStr, minStrLength) {
    while (numStr.length < minStrLength) {
        numStr = '0' + numStr;
    }
    return numStr;
}

function getNumberForSegment(segment, segmentIndex) {
    return segment.representation.startNumber + segmentIndex;
}

function replaceTokenForTemplate(url, token, value) {
    var formatTag = '%0';

    var startPos, endPos, formatTagPos, specifier, width, paddedValue;

    var tokenLen = token.length;
    var formatTagLen = formatTag.length;

    // keep looping round until all instances of <token> have been
    // replaced. once that has happened, startPos below will be -1
    // and the completed url will be returned.
    while (true) {

        // check if there is a valid $<token>...$ identifier
        // if not, return the url as is.
        startPos = url.indexOf('$' + token);
        if (startPos < 0) {
            return url;
        }

        // the next '$' must be the end of the identifier
        // if there isn't one, return the url as is.
        endPos = url.indexOf('$', startPos + tokenLen);
        if (endPos < 0) {
            return url;
        }

        // now see if there is an additional format tag suffixed to
        // the identifier within the enclosing '$' characters
        formatTagPos = url.indexOf(formatTag, startPos + tokenLen);
        if (formatTagPos > startPos && formatTagPos < endPos) {

            specifier = url.charAt(endPos - 1);
            width = parseInt(url.substring(formatTagPos + formatTagLen, endPos - 1), 10);

            // support the minimum specifiers required by IEEE 1003.1
            // (d, i , o, u, x, and X) for completeness
            switch (specifier) {
                // treat all int types as uint,
                // hence deliberate fallthrough
                case 'd':
                case 'i':
                case 'u':
                    paddedValue = zeroPadToLength(value.toString(), width);
                    break;
                case 'x':
                    paddedValue = zeroPadToLength(value.toString(16), width);
                    break;
                case 'X':
                    paddedValue = zeroPadToLength(value.toString(16), width).toUpperCase();
                    break;
                case 'o':
                    paddedValue = zeroPadToLength(value.toString(8), width);
                    break;
                default:
                    //TODO: commented out logging to supress jshint warning -- `log` is undefined here
                    //log('Unsupported/invalid IEEE 1003.1 format identifier string in URL');
                    return url;
            }
        } else {
            paddedValue = value;
        }

        url = url.substring(0, startPos) + paddedValue + url.substring(endPos + 1);
    }
}

function getIndexBasedSegment(timelineConverter, isDynamic, representation, index) {
    var seg, duration, presentationStartTime, presentationEndTime;

    duration = representation.segmentDuration;

    /*
     * From spec - If neither @duration attribute nor SegmentTimeline element is present, then the Representation
     * shall contain exactly one Media Segment. The MPD start time is 0 and the MPD duration is obtained
     * in the same way as for the last Media Segment in the Representation.
     */
    if (isNaN(duration)) {
        duration = representation.adaptation.period.duration;
    }

    presentationStartTime = representation.adaptation.period.start + index * duration;
    presentationEndTime = presentationStartTime + duration;

    seg = new _voSegmentJs2['default']();

    seg.representation = representation;
    seg.duration = duration;
    seg.presentationStartTime = presentationStartTime;

    seg.mediaStartTime = timelineConverter.calcMediaTimeFromPresentationTime(seg.presentationStartTime, representation);

    seg.availabilityStartTime = timelineConverter.calcAvailabilityStartTimeFromPresentationTime(seg.presentationStartTime, representation.adaptation.period.mpd, isDynamic);
    seg.availabilityEndTime = timelineConverter.calcAvailabilityEndTimeFromPresentationTime(presentationEndTime, representation.adaptation.period.mpd, isDynamic);

    // at this wall clock time, the video element currentTime should be seg.presentationStartTime
    seg.wallStartTime = timelineConverter.calcWallTimeForSegment(seg, isDynamic);

    seg.replacementNumber = getNumberForSegment(seg, index);
    seg.availabilityIdx = index;

    return seg;
}

function getTimeBasedSegment(timelineConverter, isDynamic, representation, time, duration, fTimescale, url, range, index) {
    var scaledTime = time / fTimescale;
    var scaledDuration = Math.min(duration / fTimescale, representation.adaptation.period.mpd.maxSegmentDuration);

    var presentationStartTime, presentationEndTime, seg;

    presentationStartTime = timelineConverter.calcPresentationTimeFromMediaTime(scaledTime, representation);
    presentationEndTime = presentationStartTime + scaledDuration;

    seg = new _voSegmentJs2['default']();

    seg.representation = representation;
    seg.duration = scaledDuration;
    seg.mediaStartTime = scaledTime;

    seg.presentationStartTime = presentationStartTime;

    // For SegmentTimeline every segment is available at loadedTime
    seg.availabilityStartTime = representation.adaptation.period.mpd.manifest.loadedTime;
    seg.availabilityEndTime = timelineConverter.calcAvailabilityEndTimeFromPresentationTime(presentationEndTime, representation.adaptation.period.mpd, isDynamic);

    // at this wall clock time, the video element currentTime should be seg.presentationStartTime
    seg.wallStartTime = timelineConverter.calcWallTimeForSegment(seg, isDynamic);

    seg.replacementTime = time;

    seg.replacementNumber = getNumberForSegment(seg, index);

    url = replaceTokenForTemplate(url, 'Number', seg.replacementNumber);
    url = replaceTokenForTemplate(url, 'Time', seg.replacementTime);
    seg.media = url;
    seg.mediaRange = range;
    seg.availabilityIdx = index;

    return seg;
}

function getSegmentByIndex(index, representation) {
    if (!representation || !representation.segments) return null;

    var ln = representation.segments.length;
    var seg, i;

    if (index < ln) {
        seg = representation.segments[index];
        if (seg && seg.availabilityIdx === index) {
            return seg;
        }
    }

    for (i = 0; i < ln; i++) {
        seg = representation.segments[i];

        if (seg && seg.availabilityIdx === index) {
            return seg;
        }
    }

    return null;
}

function decideSegmentListRangeForTimeline(timelineConverter, isDynamic, requestedTime, index, givenAvailabilityUpperLimit) {
    var availabilityLowerLimit = 2;
    var availabilityUpperLimit = givenAvailabilityUpperLimit || 10;
    var firstIdx = 0;
    var lastIdx = Number.POSITIVE_INFINITY;

    var start, end, range;

    if (isDynamic && !timelineConverter.isTimeSyncCompleted()) {
        range = { start: firstIdx, end: lastIdx };
        return range;
    }

    if (!isDynamic && requestedTime || index < 0) return null;

    // segment list should not be out of the availability window range
    start = Math.max(index - availabilityLowerLimit, firstIdx);
    end = Math.min(index + availabilityUpperLimit, lastIdx);

    range = { start: start, end: end };

    return range;
}

function decideSegmentListRangeForTemplate(timelineConverter, isDynamic, representation, requestedTime, index, givenAvailabilityUpperLimit) {
    var duration = representation.segmentDuration;
    var minBufferTime = representation.adaptation.period.mpd.manifest.minBufferTime;
    var availabilityWindow = representation.segmentAvailabilityRange;
    var periodRelativeRange = {
        start: timelineConverter.calcPeriodRelativeTimeFromMpdRelativeTime(representation, availabilityWindow.start),
        end: timelineConverter.calcPeriodRelativeTimeFromMpdRelativeTime(representation, availabilityWindow.end)
    };
    var currentSegmentList = representation.segments;
    var availabilityLowerLimit = 2 * duration;
    var availabilityUpperLimit = givenAvailabilityUpperLimit || Math.max(2 * minBufferTime, 10 * duration);

    var originAvailabilityTime = NaN;
    var originSegment = null;

    var start, end, range;

    periodRelativeRange.start = Math.max(periodRelativeRange.start, 0);

    if (isDynamic && !timelineConverter.isTimeSyncCompleted()) {
        start = Math.floor(periodRelativeRange.start / duration);
        end = Math.floor(periodRelativeRange.end / duration);
        range = { start: start, end: end };
        return range;
    }

    // if segments exist we should try to find the latest buffered time, which is the presentation time of the
    // segment for the current index
    if (currentSegmentList && currentSegmentList.length > 0) {
        originSegment = getSegmentByIndex(index, representation);
        if (originSegment) {
            originAvailabilityTime = timelineConverter.calcPeriodRelativeTimeFromMpdRelativeTime(representation, originSegment.presentationStartTime);
        } else {
            originAvailabilityTime = index > 0 ? index * duration : timelineConverter.calcPeriodRelativeTimeFromMpdRelativeTime(representation, requestedTime);
        }
    } else {
        // If no segments exist, but index > 0, it means that we switch to the other representation, so
        // we should proceed from this time.
        // Otherwise we should start from the beginning for static mpds or from the end (live edge) for dynamic mpds
        originAvailabilityTime = index > 0 ? index * duration : isDynamic ? periodRelativeRange.end : periodRelativeRange.start;
    }

    // segment list should not be out of the availability window range
    start = Math.floor(Math.max(originAvailabilityTime - availabilityLowerLimit, periodRelativeRange.start) / duration);
    end = Math.floor(Math.min(start + availabilityUpperLimit / duration, periodRelativeRange.end / duration));

    range = { start: start, end: end };

    return range;
}

},{"./../vo/Segment.js":19}],17:[function(require,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _coreFactoryMakerJs = require('../../core/FactoryMaker.js');

var _coreFactoryMakerJs2 = _interopRequireDefault(_coreFactoryMakerJs);

var _SegmentsUtilsJs = require('./SegmentsUtils.js');

function TemplateSegmentsGetter(config, isDynamic) {

    var timelineConverter = config.timelineConverter;

    var instance = undefined;

    function getSegmentsFromTemplate(representation, requestedTime, index, availabilityUpperLimit) {
        var template = representation.adaptation.period.mpd.manifest.Period_asArray[representation.adaptation.period.index].AdaptationSet_asArray[representation.adaptation.index].Representation_asArray[representation.index].SegmentTemplate;
        var duration = representation.segmentDuration;
        var availabilityWindow = representation.segmentAvailabilityRange;

        var segments = [];
        var url = null;
        var seg = null;

        var segmentRange, periodSegIdx, startIdx, endIdx, start;

        start = representation.startNumber;

        if (isNaN(duration) && !isDynamic) {
            segmentRange = { start: start, end: start };
        } else {
            segmentRange = (0, _SegmentsUtilsJs.decideSegmentListRangeForTemplate)(timelineConverter, isDynamic, representation, requestedTime, index, availabilityUpperLimit);
        }

        startIdx = segmentRange.start;
        endIdx = segmentRange.end;

        for (periodSegIdx = startIdx; periodSegIdx <= endIdx; periodSegIdx++) {

            seg = (0, _SegmentsUtilsJs.getIndexBasedSegment)(timelineConverter, isDynamic, representation, periodSegIdx);
            seg.replacementTime = (start + periodSegIdx - 1) * representation.segmentDuration;
            url = template.media;
            url = (0, _SegmentsUtilsJs.replaceTokenForTemplate)(url, 'Number', seg.replacementNumber);
            url = (0, _SegmentsUtilsJs.replaceTokenForTemplate)(url, 'Time', seg.replacementTime);
            seg.media = url;

            segments.push(seg);
            seg = null;
        }

        if (isNaN(duration)) {
            representation.availableSegmentsNumber = 1;
        } else {
            representation.availableSegmentsNumber = Math.ceil((availabilityWindow.end - availabilityWindow.start) / duration);
        }

        return segments;
    }

    instance = {
        getSegments: getSegmentsFromTemplate
    };

    return instance;
}

TemplateSegmentsGetter.__dashjs_factory_name = 'TemplateSegmentsGetter';
var factory = _coreFactoryMakerJs2['default'].getClassFactory(TemplateSegmentsGetter);
exports['default'] = factory;
module.exports = exports['default'];

},{"../../core/FactoryMaker.js":10,"./SegmentsUtils.js":16}],18:[function(require,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _coreFactoryMakerJs = require('../../core/FactoryMaker.js');

var _coreFactoryMakerJs2 = _interopRequireDefault(_coreFactoryMakerJs);

var _SegmentsUtilsJs = require('./SegmentsUtils.js');

function TimelineSegmentsGetter(config, isDynamic) {

    var timelineConverter = config.timelineConverter;

    var instance = undefined;

    function getSegmentsFromTimeline(representation, requestedTime, index, availabilityUpperLimit) {
        var template = representation.adaptation.period.mpd.manifest.Period_asArray[representation.adaptation.period.index].AdaptationSet_asArray[representation.adaptation.index].Representation_asArray[representation.index].SegmentTemplate;
        var timeline = template.SegmentTimeline;
        var isAvailableSegmentNumberCalculated = representation.availableSegmentsNumber > 0;

        var maxSegmentsAhead = 10;
        var time = 0;
        var scaledTime = 0;
        var availabilityIdx = -1;
        var segments = [];
        var isStartSegmentForRequestedTimeFound = false;

        var fragments, frag, i, len, j, repeat, repeatEndTime, nextFrag, calculatedRange, hasEnoughSegments, requiredMediaTime, startIdx, endIdx, fTimescale;

        var createSegment = function createSegment(s) {
            return (0, _SegmentsUtilsJs.getTimeBasedSegment)(timelineConverter, isDynamic, representation, time, s.d, fTimescale, template.media, s.mediaRange, availabilityIdx);
        };

        fTimescale = representation.timescale;

        fragments = timeline.S_asArray;

        calculatedRange = (0, _SegmentsUtilsJs.decideSegmentListRangeForTimeline)(timelineConverter, isDynamic, requestedTime, index, availabilityUpperLimit);

        // if calculatedRange exists we should generate segments that belong to this range.
        // Otherwise generate maxSegmentsAhead segments ahead of the requested time
        if (calculatedRange) {
            startIdx = calculatedRange.start;
            endIdx = calculatedRange.end;
        } else {
            requiredMediaTime = timelineConverter.calcMediaTimeFromPresentationTime(requestedTime || 0, representation);
        }

        for (i = 0, len = fragments.length; i < len; i++) {
            frag = fragments[i];
            repeat = 0;
            if (frag.hasOwnProperty('r')) {
                repeat = frag.r;
            }

            //For a repeated S element, t belongs only to the first segment
            if (frag.hasOwnProperty('t')) {
                time = frag.t;
                scaledTime = time / fTimescale;
            }

            //This is a special case: "A negative value of the @r attribute of the S element indicates that the duration indicated in @d attribute repeats until the start of the next S element, the end of the Period or until the
            // next MPD update."
            if (repeat < 0) {
                nextFrag = fragments[i + 1];

                if (nextFrag && nextFrag.hasOwnProperty('t')) {
                    repeatEndTime = nextFrag.t / fTimescale;
                } else {
                    var availabilityEnd = representation.segmentAvailabilityRange ? representation.segmentAvailabilityRange.end : timelineConverter.calcSegmentAvailabilityRange(representation, isDynamic).end;
                    repeatEndTime = timelineConverter.calcMediaTimeFromPresentationTime(availabilityEnd, representation);
                    representation.segmentDuration = frag.d / fTimescale;
                }

                repeat = Math.ceil((repeatEndTime - scaledTime) / (frag.d / fTimescale)) - 1;
            }

            // if we have enough segments in the list, but we have not calculated the total number of the segments yet we
            // should continue the loop and calc the number. Once it is calculated, we can break the loop.
            if (hasEnoughSegments) {
                if (isAvailableSegmentNumberCalculated) break;
                availabilityIdx += repeat + 1;
                continue;
            }

            for (j = 0; j <= repeat; j++) {
                availabilityIdx++;

                if (calculatedRange) {
                    if (availabilityIdx > endIdx) {
                        hasEnoughSegments = true;
                        if (isAvailableSegmentNumberCalculated) break;
                        continue;
                    }

                    if (availabilityIdx >= startIdx) {
                        segments.push(createSegment(frag));
                    }
                } else {
                    if (segments.length > maxSegmentsAhead) {
                        hasEnoughSegments = true;
                        if (isAvailableSegmentNumberCalculated) break;
                        continue;
                    }

                    // In some cases when requiredMediaTime = actual end time of the last segment
                    // it is possible that this time a bit exceeds the declared end time of the last segment.
                    // in this case we still need to include the last segment in the segment list. to do this we
                    // use a correction factor = 1.5. This number is used because the largest possible deviation is
                    // is 50% of segment duration.
                    if (isStartSegmentForRequestedTimeFound) {
                        segments.push(createSegment(frag));
                    } else if (scaledTime >= requiredMediaTime - frag.d / fTimescale * 1.5) {
                        isStartSegmentForRequestedTimeFound = true;
                        segments.push(createSegment(frag));
                    }
                }

                time += frag.d;
                scaledTime = time / fTimescale;
            }
        }

        if (!isAvailableSegmentNumberCalculated) {
            representation.availableSegmentsNumber = availabilityIdx + 1;
        }

        return segments;
    }

    instance = {
        getSegments: getSegmentsFromTimeline
    };

    return instance;
}

TimelineSegmentsGetter.__dashjs_factory_name = 'TimelineSegmentsGetter';
var factory = _coreFactoryMakerJs2['default'].getClassFactory(TimelineSegmentsGetter);
exports['default'] = factory;
module.exports = exports['default'];

},{"../../core/FactoryMaker.js":10,"./SegmentsUtils.js":16}],19:[function(require,module,exports){
/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * @class
 * @ignore
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Segment = function Segment() {
  _classCallCheck(this, Segment);

  this.indexRange = null;
  this.index = null;
  this.mediaRange = null;
  this.media = null;
  this.duration = NaN;
  // this is the time that should be inserted into the media url
  this.replacementTime = null;
  // this is the number that should be inserted into the media url
  this.replacementNumber = NaN;
  // This is supposed to match the time encoded in the media Segment
  this.mediaStartTime = NaN;
  // When the source buffer timeOffset is set to MSETimeOffset this is the
  // time that will match the seekTarget and video.currentTime
  this.presentationStartTime = NaN;
  // Do not schedule this segment until
  this.availabilityStartTime = NaN;
  // Ignore and  discard this segment after
  this.availabilityEndTime = NaN;
  // The index of the segment inside the availability window
  this.availabilityIdx = NaN;
  // For dynamic mpd's, this is the wall clock time that the video
  // element currentTime should be presentationStartTime
  this.wallStartTime = NaN;
  this.representation = null;
};

exports["default"] = Segment;
module.exports = exports["default"];

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvcnVzbGFuL1dvcmsvc3RyZWFtcm9vdC9zdHJlYW1yb290LWRhc2gvbGliL0Rhc2hqc1dyYXBwZXIuanMiLCIvVXNlcnMvcnVzbGFuL1dvcmsvc3RyZWFtcm9vdC9zdHJlYW1yb290LWRhc2gvbGliL01hbmlmZXN0SGVscGVyLmpzIiwiL1VzZXJzL3J1c2xhbi9Xb3JrL3N0cmVhbXJvb3Qvc3RyZWFtcm9vdC1kYXNoL2xpYi9NZWRpYU1hcC5qcyIsIi9Vc2Vycy9ydXNsYW4vV29yay9zdHJlYW1yb290L3N0cmVhbXJvb3QtZGFzaC9saWIvUGxheWVySW50ZXJmYWNlLmpzIiwiL1VzZXJzL3J1c2xhbi9Xb3JrL3N0cmVhbXJvb3Qvc3RyZWFtcm9vdC1kYXNoL2xpYi9TUkZyYWdtZW50TG9hZGVyLmpzIiwiL1VzZXJzL3J1c2xhbi9Xb3JrL3N0cmVhbXJvb3Qvc3RyZWFtcm9vdC1kYXNoL2xpYi9TZWdtZW50Vmlldy5qcyIsIi9Vc2Vycy9ydXNsYW4vV29yay9zdHJlYW1yb290L3N0cmVhbXJvb3QtZGFzaC9saWIvU2VnbWVudHNDYWNoZS5qcyIsIi9Vc2Vycy9ydXNsYW4vV29yay9zdHJlYW1yb290L3N0cmVhbXJvb3QtZGFzaC9saWIvVHJhY2tWaWV3LmpzIiwiL1VzZXJzL3J1c2xhbi9Xb3JrL3N0cmVhbXJvb3Qvc3RyZWFtcm9vdC1kYXNoL25vZGVfbW9kdWxlcy9kYXNoanMvc3JjL2NvcmUvRXZlbnRCdXMuanMiLCIvVXNlcnMvcnVzbGFuL1dvcmsvc3RyZWFtcm9vdC9zdHJlYW1yb290LWRhc2gvbm9kZV9tb2R1bGVzL2Rhc2hqcy9zcmMvY29yZS9GYWN0b3J5TWFrZXIuanMiLCIvVXNlcnMvcnVzbGFuL1dvcmsvc3RyZWFtcm9vdC9zdHJlYW1yb290LWRhc2gvbm9kZV9tb2R1bGVzL2Rhc2hqcy9zcmMvY29yZS9ldmVudHMvQ29yZUV2ZW50cy5qcyIsIi9Vc2Vycy9ydXNsYW4vV29yay9zdHJlYW1yb290L3N0cmVhbXJvb3QtZGFzaC9ub2RlX21vZHVsZXMvZGFzaGpzL3NyYy9jb3JlL2V2ZW50cy9FdmVudHMuanMiLCIvVXNlcnMvcnVzbGFuL1dvcmsvc3RyZWFtcm9vdC9zdHJlYW1yb290LWRhc2gvbm9kZV9tb2R1bGVzL2Rhc2hqcy9zcmMvY29yZS9ldmVudHMvRXZlbnRzQmFzZS5qcyIsIi9Vc2Vycy9ydXNsYW4vV29yay9zdHJlYW1yb290L3N0cmVhbXJvb3QtZGFzaC9ub2RlX21vZHVsZXMvZGFzaGpzL3NyYy9kYXNoL3V0aWxzL0xpc3RTZWdtZW50c0dldHRlci5qcyIsIi9Vc2Vycy9ydXNsYW4vV29yay9zdHJlYW1yb290L3N0cmVhbXJvb3QtZGFzaC9ub2RlX21vZHVsZXMvZGFzaGpzL3NyYy9kYXNoL3V0aWxzL1NlZ21lbnRzR2V0dGVyLmpzIiwiL1VzZXJzL3J1c2xhbi9Xb3JrL3N0cmVhbXJvb3Qvc3RyZWFtcm9vdC1kYXNoL25vZGVfbW9kdWxlcy9kYXNoanMvc3JjL2Rhc2gvdXRpbHMvU2VnbWVudHNVdGlscy5qcyIsIi9Vc2Vycy9ydXNsYW4vV29yay9zdHJlYW1yb290L3N0cmVhbXJvb3QtZGFzaC9ub2RlX21vZHVsZXMvZGFzaGpzL3NyYy9kYXNoL3V0aWxzL1RlbXBsYXRlU2VnbWVudHNHZXR0ZXIuanMiLCIvVXNlcnMvcnVzbGFuL1dvcmsvc3RyZWFtcm9vdC9zdHJlYW1yb290LWRhc2gvbm9kZV9tb2R1bGVzL2Rhc2hqcy9zcmMvZGFzaC91dGlscy9UaW1lbGluZVNlZ21lbnRzR2V0dGVyLmpzIiwiL1VzZXJzL3J1c2xhbi9Xb3JrL3N0cmVhbXJvb3Qvc3RyZWFtcm9vdC1kYXNoL25vZGVfbW9kdWxlcy9kYXNoanMvc3JjL2Rhc2gvdm8vU2VnbWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs4QkNBMkIsa0JBQWtCOzs7O3dCQUN4QixZQUFZOzs7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RCxZQUFRLEdBQUc7QUFDUCxtQkFBVyxFQUFFLHVCQUF1QjtLQUN2QyxDQUFDOztBQUVGLFdBQU8sUUFBUSxDQUFDO0NBQ25COztBQUVELHNCQUFzQixDQUFDLHFCQUFxQixHQUFHLHdCQUF3QixDQUFDO0FBQ3hFLElBQU0sT0FBTyxHQUFHLGdDQUFhLGVBQWUsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO3FCQUN0RCxPQUFPOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lDMUpoQixPQUFPLEdBQ0UsU0FEVCxPQUFPLEdBQ0s7d0JBRFosT0FBTzs7QUFFTCxNQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztBQUN2QixNQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNsQixNQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztBQUN2QixNQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNsQixNQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQzs7QUFFcEIsTUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7O0FBRTVCLE1BQUksQ0FBQyxpQkFBaUIsR0FBRyxHQUFHLENBQUM7O0FBRTdCLE1BQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxDQUFDOzs7QUFHMUIsTUFBSSxDQUFDLHFCQUFxQixHQUFHLEdBQUcsQ0FBQzs7QUFFakMsTUFBSSxDQUFDLHFCQUFxQixHQUFHLEdBQUcsQ0FBQzs7QUFFakMsTUFBSSxDQUFDLG1CQUFtQixHQUFHLEdBQUcsQ0FBQzs7QUFFL0IsTUFBSSxDQUFDLGVBQWUsR0FBRyxHQUFHLENBQUM7OztBQUczQixNQUFJLENBQUMsYUFBYSxHQUFHLEdBQUcsQ0FBQztBQUN6QixNQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztDQUM5Qjs7cUJBR1UsT0FBTyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgTWFuaWZlc3RIZWxwZXIgZnJvbSAnLi9NYW5pZmVzdEhlbHBlcic7XG5pbXBvcnQgTWVkaWFNYXAgZnJvbSAnLi9NZWRpYU1hcCc7XG5pbXBvcnQgU2VnbWVudFZpZXcgZnJvbSAnLi9TZWdtZW50Vmlldyc7XG5pbXBvcnQgU1JGcmFnbWVudExvYWRlciBmcm9tICcuL1NSRnJhZ21lbnRMb2FkZXInO1xuaW1wb3J0IFBsYXllckludGVyZmFjZSBmcm9tICcuL1BsYXllckludGVyZmFjZSc7XG5cbmNsYXNzIERhc2hqc1dyYXBwZXIge1xuXG4gICAgY29uc3RydWN0b3IgKHBsYXllciwgdmlkZW9FbGVtZW50LCBwMnBDb25maWcsIGxpdmVEZWxheSkge1xuICAgICAgICB0aGlzLl9wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgICAgIHRoaXMuX3ZpZGVvRWxlbWVudCA9IHZpZGVvRWxlbWVudDtcbiAgICAgICAgdGhpcy5fcDJwQ29uZmlnID0gcDJwQ29uZmlnO1xuICAgICAgICB0aGlzLl9saXZlRGVsYXkgPSBsaXZlRGVsYXk7XG5cbiAgICAgICAgdGhpcy5fcGxheWVyLnNldExpdmVEZWxheShsaXZlRGVsYXkpO1xuXG4gICAgICAgIHRoaXMuX3BsYXllci5vbihkYXNoanMuTWVkaWFQbGF5ZXIuZXZlbnRzLk1BTklGRVNUX0xPQURFRCwgdGhpcy5fb25NYW5pZmVzdExvYWRlZCwgdGhpcyk7XG4gICAgfVxuXG4gICAgX29uTWFuaWZlc3RMb2FkZWQgKHsgZGF0YSB9KSB7XG5cbiAgICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgICAgICByZXR1cm47IC8vIGV2ZW50IGZpcmVzIHR3aWNlIHdoZW4gbWFuaWZlc3QgaXMgY2hhbmdlZCwgZmlyc3QgdGltZSB0aGUgZGF0YSBpcyBudWxsXG4gICAgICAgIH1cblxuICAgICAgICAvL1RPRE86IHdlIGRvbid0IGtub3cgaWYgdGhpcyBldmVudCBtYXkgZmlyZSBvbiBsaXZlIHN0cmVhbXMgd2l0aCBzYW1lIG1hbmlmZXN0IHVybC4gaWYgaXQgZG9lc24ndCwgd2Ugc2hvdWxkIHJlbW92ZSB0aGlzIGNoZWNrXG4gICAgICAgIGlmICh0aGlzLl9tYW5pZmVzdCAmJiBkYXRhLnVybCA9PT0gdGhpcy5fbWFuaWZlc3QudXJsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9tYW5pZmVzdCA9IGRhdGE7XG5cbiAgICAgICAgaWYgKHdpbmRvdy5zdHJlYW1yb290RG93bmxvYWRlcikge1xuICAgICAgICAgICAgd2luZG93LnN0cmVhbXJvb3REb3dubG9hZGVyLmRpc3Bvc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBtYW5pZmVzdEhlbHBlciA9IG5ldyBNYW5pZmVzdEhlbHBlcih0aGlzLl9wbGF5ZXIsIHRoaXMuX21hbmlmZXN0KTtcbiAgICAgICAgbGV0IHBsYXllckludGVyZmFjZSA9IG5ldyBQbGF5ZXJJbnRlcmZhY2UodGhpcy5fcGxheWVyLCBtYW5pZmVzdEhlbHBlciwgdGhpcy5fbGl2ZURlbGF5KTtcbiAgICAgICAgbGV0IG1lZGlhTWFwID0gbmV3IE1lZGlhTWFwKG1hbmlmZXN0SGVscGVyKTtcblxuICAgICAgICAvLyBUT0RPOiBSZW1vdmUgdGhpcyBnbG9iYWwgZGVmaW5pdGlvblxuICAgICAgICB3aW5kb3cuc3RyZWFtcm9vdERvd25sb2FkZXIgPSBuZXcgd2luZG93LlN0cmVhbXJvb3QuRG93bmxvYWRlcihcbiAgICAgICAgICAgIHBsYXllckludGVyZmFjZSxcbiAgICAgICAgICAgIHRoaXMuX21hbmlmZXN0LnVybCxcbiAgICAgICAgICAgIG1lZGlhTWFwLFxuICAgICAgICAgICAgdGhpcy5fcDJwQ29uZmlnLFxuICAgICAgICAgICAgU2VnbWVudFZpZXcsXG4gICAgICAgICAgICB0aGlzLl92aWRlb0VsZW1lbnRcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLl9wbGF5ZXIuZXh0ZW5kKFwiRnJhZ21lbnRMb2FkZXJcIiwgU1JGcmFnbWVudExvYWRlciwgdHJ1ZSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBEYXNoanNXcmFwcGVyO1xuIiwiaW1wb3J0IFRyYWNrVmlldyBmcm9tICcuL1RyYWNrVmlldyc7XG5pbXBvcnQgU2VnbWVudHNHZXR0ZXIgZnJvbSAnLi4vbm9kZV9tb2R1bGVzL2Rhc2hqcy9zcmMvZGFzaC91dGlscy9TZWdtZW50c0dldHRlcic7XG5pbXBvcnQgU2VnbWVudHNDYWNoZSBmcm9tICcuL1NlZ21lbnRzQ2FjaGUnO1xuXG5jbGFzcyBNYW5pZmVzdEhlbHBlciB7XG5cbiAgICBjb25zdHJ1Y3RvciAocGxheWVyLCBtYW5pZmVzdCkge1xuXG4gICAgICAgIHRoaXMuX3BsYXllciA9IHBsYXllcjtcbiAgICAgICAgdGhpcy5fbWFuaWZlc3QgPSBtYW5pZmVzdDtcbiAgICAgICAgdGhpcy5fc2VnbWVudHNDYWNoZSA9IG5ldyBTZWdtZW50c0NhY2hlKHBsYXllcik7XG5cbiAgICAgICAgbGV0IGdldENvbmZpZyxcbiAgICAgICAgICAgIGdldENvbnRleHQsXG4gICAgICAgICAgICBnZXREYXNoTWFuaWZlc3RNb2RlbCxcbiAgICAgICAgICAgIGdldFRpbWVsaW5lQ29udmVydGVyO1xuXG4gICAgICAgIGZ1bmN0aW9uIFN0cmVhbVNSIChjb25maWcpIHtcblxuICAgICAgICAgICAgbGV0IGZhY3RvcnkgPSB0aGlzLmZhY3RvcnksXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHRoaXMuY29udGV4dDtcblxuICAgICAgICAgICAgZ2V0Q29uZmlnID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGdldENvbnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udGV4dDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGdldERhc2hNYW5pZmVzdE1vZGVsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWN0b3J5LmdldFNpbmdsZXRvbkluc3RhbmNlKGNvbnRleHQsIFwiRGFzaE1hbmlmZXN0TW9kZWxcIik7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBnZXRUaW1lbGluZUNvbnZlcnRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29uZmlnLnRpbWVsaW5lQ29udmVydGVyO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBsYXllci5leHRlbmQoXCJTdHJlYW1cIiwgU3RyZWFtU1IsIHRydWUpO1xuXG4gICAgICAgIHRoaXMuX2dldERhc2hNYW5pZmVzdE1vZGVsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGdldERhc2hNYW5pZmVzdE1vZGVsID8gZ2V0RGFzaE1hbmlmZXN0TW9kZWwoKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9nZXRUaW1lbGluZUNvbnZlcnRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRUaW1lbGluZUNvbnZlcnRlciA/IGdldFRpbWVsaW5lQ29udmVydGVyKCkgOiB1bmRlZmluZWQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5fZ2V0Q29uZmlnID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0Q29uZmlnKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5fZ2V0Q29udGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGdldENvbnRleHQoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9nZXRTZWdtZW50c0dldHRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9zZWdtZW50c0dldHRlcikge1xuICAgICAgICAgICAgICAgIGxldCBjb250ZXh0ID0gdGhpcy5fZ2V0Q29udGV4dCgpO1xuICAgICAgICAgICAgICAgIGxldCBjb25maWcgPSB0aGlzLl9nZXRDb25maWcoKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX3NlZ21lbnRzR2V0dGVyID0gU2VnbWVudHNHZXR0ZXIoY29udGV4dCkuY3JlYXRlKGNvbmZpZywgdGhpcy5pc0xpdmUoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zZWdtZW50c0dldHRlcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFNlZ21lbnRMaXN0ICh0cmFja1ZpZXcpIHtcblxuICAgICAgICBpZiAodGhpcy5fc2VnbWVudHNDYWNoZS5oYXNTZWdtZW50cyh0cmFja1ZpZXcpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc2VnbWVudHNDYWNoZS5nZXRTZWdtZW50cyh0cmFja1ZpZXcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRhc2hNYW5pZmVzdE1vZGVsID0gdGhpcy5fZ2V0RGFzaE1hbmlmZXN0TW9kZWwoKSxcbiAgICAgICAgICAgIHRpbWVsaW5lQ29udmVydGVyID0gdGhpcy5fZ2V0VGltZWxpbmVDb252ZXJ0ZXIoKTtcblxuICAgICAgICBpZiAoIWRhc2hNYW5pZmVzdE1vZGVsIHx8ICF0aW1lbGluZUNvbnZlcnRlcikgdGhyb3cgbmV3IEVycm9yKFwiVHJpZWQgdG8gZ2V0IHJlcHJlc2VudGF0aW9uIGJlZm9yZSB3ZSBjb3VsZCBoYXZlIGFjY2VzcyB0byBkYXNoLmpzIG1hbmlmZXN0IGludGVybmFsc1wiKTtcblxuICAgICAgICB2YXIgbXBkID0gZGFzaE1hbmlmZXN0TW9kZWwuZ2V0TXBkKHRoaXMuX21hbmlmZXN0KTtcbiAgICAgICAgdmFyIHBlcmlvZCA9IGRhc2hNYW5pZmVzdE1vZGVsLmdldFJlZ3VsYXJQZXJpb2RzKHRoaXMuX21hbmlmZXN0LCBtcGQpW3RyYWNrVmlldy5wZXJpb2RJZF07XG4gICAgICAgIHZhciBhZGFwdGF0aW9uID0gZGFzaE1hbmlmZXN0TW9kZWwuZ2V0QWRhcHRhdGlvbnNGb3JQZXJpb2QodGhpcy5fbWFuaWZlc3QsIHBlcmlvZClbdHJhY2tWaWV3LmFkYXB0YXRpb25TZXRJZF07XG4gICAgICAgIHZhciByZXByZXNlbnRhdGlvbiA9IGRhc2hNYW5pZmVzdE1vZGVsLmdldFJlcHJlc2VudGF0aW9uc0ZvckFkYXB0YXRpb24odGhpcy5fbWFuaWZlc3QsIGFkYXB0YXRpb24pW3RyYWNrVmlldy5yZXByZXNlbnRhdGlvbklkXTtcbiAgICAgICAgdmFyIGlzRHluYW1pYyA9IHRoaXMuaXNMaXZlKCk7XG5cbiAgICAgICAgcmVwcmVzZW50YXRpb24uc2VnbWVudEF2YWlsYWJpbGl0eVJhbmdlID0gdGltZWxpbmVDb252ZXJ0ZXIuY2FsY1NlZ21lbnRBdmFpbGFiaWxpdHlSYW5nZShyZXByZXNlbnRhdGlvbiwgaXNEeW5hbWljKTtcbiAgICAgICAgdmFyIHNlZ21lbnRzID0gdGhpcy5fZ2V0U2VnbWVudHNHZXR0ZXIoKS5nZXRTZWdtZW50cyhyZXByZXNlbnRhdGlvbiwgMCwgMCwgdW5kZWZpbmVkLCAxMDAwMDAwKTtcblxuICAgICAgICByZXR1cm4gc2VnbWVudHM7XG4gICAgfVxuXG4gICAgaXNMaXZlICgpIHtcbiAgICAgICAgdmFyIGRhc2hNYW5pZmVzdE1vZGVsID0gdGhpcy5fZ2V0RGFzaE1hbmlmZXN0TW9kZWwoKTtcblxuICAgICAgICBpZiAoIWRhc2hNYW5pZmVzdE1vZGVsKSB0aHJvdyBuZXcgRXJyb3IoXCJUcmllZCB0byBnZXQgcmVwcmVzZW50YXRpb24gYmVmb3JlIHdlIGNvdWxkIGhhdmUgYWNjZXNzIHRvIGRhc2guanMgbWFuaWZlc3QgaW50ZXJuYWxzXCIpO1xuXG4gICAgICAgIHJldHVybiBkYXNoTWFuaWZlc3RNb2RlbC5nZXRJc0R5bmFtaWModGhpcy5fbWFuaWZlc3QpO1xuICAgIH1cblxuICAgIGdldEN1cnJlbnRUcmFja3MgKCkge1xuICAgICAgICB2YXIgdHJhY2tzID0ge307XG4gICAgICAgIGZvciAobGV0IHR5cGUgb2YgW1wiYXVkaW9cIiwgXCJ2aWRlb1wiXSkge1xuICAgICAgICAgICAgbGV0IHRyYWNrc0ZvclR5cGUgPSB0aGlzLl9wbGF5ZXIuZ2V0VHJhY2tzRm9yKHR5cGUpO1xuICAgICAgICAgICAgaWYgKHRyYWNrc0ZvclR5cGUgJiYgdHJhY2tzRm9yVHlwZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRUcmFjayA9IHRoaXMuX3BsYXllci5nZXRDdXJyZW50VHJhY2tGb3IodHlwZSk7XG4gICAgICAgICAgICAgICAgbGV0IHF1YWxpdHkgPSB0aGlzLl9wbGF5ZXIuZ2V0UXVhbGl0eUZvcih0eXBlKTtcbiAgICAgICAgICAgICAgICB0cmFja3NbdHlwZV0gPSBuZXcgVHJhY2tWaWV3KHtcbiAgICAgICAgICAgICAgICAgICAgcGVyaW9kSWQ6IGN1cnJlbnRUcmFjay5zdHJlYW1JbmZvLmluZGV4LFxuICAgICAgICAgICAgICAgICAgICBhZGFwdGF0aW9uU2V0SWQ6IGN1cnJlbnRUcmFjay5pbmRleCxcbiAgICAgICAgICAgICAgICAgICAgcmVwcmVzZW50YXRpb25JZDogcXVhbGl0eVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cmFja3M7XG4gICAgfVxuXG4gICAgZ2V0QWxsVHJhY2tzICgpIHtcbiAgICAgICAgbGV0IHRyYWNrcyA9IHt9O1xuXG4gICAgICAgIGxldCBwZXJpb2RzID0gdGhpcy5fcGxheWVyLmdldFN0cmVhbXNGcm9tTWFuaWZlc3QodGhpcy5fbWFuaWZlc3QpO1xuICAgICAgICBmb3IgKGxldCBwZXJpb2Qgb2YgcGVyaW9kcykge1xuICAgICAgICAgICAgZm9yIChsZXQgdHlwZSBvZiBbXCJhdWRpb1wiLCBcInZpZGVvXCJdKSB7XG5cbiAgICAgICAgICAgICAgICB0cmFja3NbdHlwZV0gPSBbXTtcblxuICAgICAgICAgICAgICAgIGxldCBhZGFwdGF0aW9uU2V0cyA9IHRoaXMuX3BsYXllci5nZXRUcmFja3NGb3JUeXBlRnJvbU1hbmlmZXN0KHR5cGUsIHRoaXMuX21hbmlmZXN0LCBwZXJpb2QpO1xuICAgICAgICAgICAgICAgIGlmICghYWRhcHRhdGlvblNldHMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYWRhcHRhdGlvblNldCBvZiBhZGFwdGF0aW9uU2V0cykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFkYXB0YXRpb25TZXQucmVwcmVzZW50YXRpb25Db3VudDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFja3NbdHlwZV0ucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgVHJhY2tWaWV3KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kSWQ6IHBlcmlvZC5pbmRleCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRhcHRhdGlvblNldElkOiBhZGFwdGF0aW9uU2V0LmluZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXByZXNlbnRhdGlvbklkOiBpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJhY2tzO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWFuaWZlc3RIZWxwZXI7XG4iLCJpbXBvcnQgU2VnbWVudFZpZXcgZnJvbSAnLi9TZWdtZW50Vmlldyc7XG5pbXBvcnQgVHJhY2tWaWV3IGZyb20gJy4vVHJhY2tWaWV3JztcblxuY2xhc3MgTWVkaWFNYXAge1xuICAgIGNvbnN0cnVjdG9yIChtYW5pZmVzdEhlbHBlcikge1xuICAgICAgICB0aGlzLl9tYW5pZmVzdEhlbHBlciA9IG1hbmlmZXN0SGVscGVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHJldHVybnMgYm9vbGVhblxuICAgICAqL1xuICAgIGlzTGl2ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21hbmlmZXN0SGVscGVyLmlzTGl2ZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICogQHBhcmFtIHNlZ21lbnRWaWV3IHtTZWdtZW50Vmlld31cbiAgICAqIEByZXR1cm5zIG51bWJlciAgICg6d2FybmluZzogdGltZSBtdXN0IGJlIGluIHNlY29uZCBpZiB3ZSB3YW50IHRoZSBkZWJ1ZyB0b29sIChidWZmZXIgZGlzcGxheSkgdG8gd29yayBwcm9wZXJseSlcbiAgICAqL1xuICAgIGdldFNlZ21lbnRUaW1lIChzZWdtZW50Vmlldykge1xuICAgICAgICByZXR1cm4gc2VnbWVudFZpZXcuc2VnbWVudElkIC8gMTA7IC8vVE9ETzogc2hvdWxkIG5vdCBpdCBiZSBhIHN0YXRpYyBtZXRob2Qgb2YgU2VnbWVudFZpZXc/XG4gICAgfVxuXG4gICAgLyoqXG4gICAgKiBAcGFyYW0gdHJhY2tWaWV3IHtUcmFja1ZpZXd9XG4gICAgKiBAcGFyYW0gYmVnaW5UaW1lIHtudW1iZXJ9XG4gICAgKiBAcGFyYW0gZHVyYXRpb24ge251bWJlcn1cbiAgICAqIEByZXR1cm5zIFtTZWdtZW50Vmlld11cbiAgICAqL1xuXG4gICAgZ2V0U2VnbWVudExpc3QgKHRyYWNrVmlldywgYmVnaW5UaW1lLCBkdXJhdGlvbikge1xuXG4gICAgICAgIGxldCBkYXNoanNTZWdtZW50TGlzdCA9IHRoaXMuX21hbmlmZXN0SGVscGVyLmdldFNlZ21lbnRMaXN0KHRyYWNrVmlldyk7XG5cbiAgICAgICAgbGV0IHNlZ21lbnRMaXN0ID0gW10sXG4gICAgICAgICAgICBzZWdtZW50VmlldztcblxuICAgICAgICBpZiAoZGFzaGpzU2VnbWVudExpc3QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHNlZ21lbnRMaXN0O1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgc2VnbWVudCBvZiBkYXNoanNTZWdtZW50TGlzdCkge1xuICAgICAgICAgICAgbGV0IHN0YXJ0VGltZSA9IHNlZ21lbnQubWVkaWFTdGFydFRpbWUgfHwgc2VnbWVudC5zdGFydFRpbWU7XG4gICAgICAgICAgICBpZiAoc2VnbWVudC50aW1lc2NhbGUpIHtcbiAgICAgICAgICAgICAgICBzdGFydFRpbWUgPSBzdGFydFRpbWUgLyBzZWdtZW50LnRpbWVzY2FsZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGJlZ2luVGltZSA8PSBzdGFydFRpbWUgJiYgc3RhcnRUaW1lIDw9IGJlZ2luVGltZSArIGR1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgc2VnbWVudFZpZXcgPSBuZXcgU2VnbWVudFZpZXcoe1xuICAgICAgICAgICAgICAgICAgICB0cmFja1ZpZXcsXG4gICAgICAgICAgICAgICAgICAgIHNlZ21lbnRJZDogTWF0aC5yb3VuZChzdGFydFRpbWUgKiAxMCkgLy9UT0RPOiBtYWtlIHRoaXMgc3RhdGljIG1ldGhvZCBvZiBTZWdtZW50Vmlld1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHNlZ21lbnRMaXN0LnB1c2goc2VnbWVudFZpZXcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNlZ21lbnRMaXN0O1xuICAgIH1cblxuICAgIGdldE5leHRTZWdtZW50VmlldyhzZWdtZW50Vmlldykge1xuICAgICAgICB2YXIgYmVnaW5UaW1lID0gdGhpcy5nZXRTZWdtZW50VGltZShzZWdtZW50VmlldykgKyAwLjI7XG4gICAgICAgIC8vICswLjIgd2lsbCBnaXZlIHVzIGEgYmVnaW5UaW1lIGp1c3QgYWZ0ZXIgdGhlIGJlZ2lubmluZyBvZiB0aGUgc2VnbWVudFZpZXcsIHNvIHdlIGtub3cgaXQgd29uJ3QgYmUgaW5jbHVkZWQgaW4gdGhlIGZvbGxvd2luZyBnZXRTZWdtZW50TGlzdCAoY29uZGl0aW9uIGluY2x1ZGVzIGJlZ2luVGltZSA8PSBzZWdtZW50Lm1lZGlhU3RhcnRUaW1lKVxuXG4gICAgICAgIHZhciBzZWdtZW50TGlzdCA9IHRoaXMuZ2V0U2VnbWVudExpc3Qoc2VnbWVudFZpZXcudHJhY2tWaWV3LCBiZWdpblRpbWUsIDMwKTtcbiAgICAgICAgcmV0dXJuIHNlZ21lbnRMaXN0Lmxlbmd0aCA/IHNlZ21lbnRMaXN0WzBdIDogbnVsbDtcbiAgICB9XG5cbiAgICBnZXRUcmFja3NMaXN0ICgpIHtcbiAgICAgICAgbGV0IHRyYWNrcyA9IHRoaXMuX21hbmlmZXN0SGVscGVyLmdldEFsbFRyYWNrcygpLFxuICAgICAgICAgICAgdHJhY2tBcnJheSA9IFtdO1xuXG4gICAgICAgIC8vIEtpbmQgb2Ygc3Vja3MgdGhhdCB3ZSBkb24ndCBleHBlY3QgdGhlIHNhbWUgZm9ybWF0IHRoYW4gaW4gb25UcmFja0NoYW5nZVxuICAgICAgICBmb3IgKGxldCB0eXBlIG9mIFtcImF1ZGlvXCIsIFwidmlkZW9cIl0pIHtcbiAgICAgICAgICAgIGlmICh0cmFja3NbdHlwZV0pIHtcbiAgICAgICAgICAgICAgICB0cmFja0FycmF5LnB1c2goLi4udHJhY2tzW3R5cGVdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cmFja0FycmF5O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVkaWFNYXA7XG4iLCJpbXBvcnQgVHJhY2tWaWV3IGZyb20gJy4vVHJhY2tWaWV3JztcblxuY2xhc3MgUGxheWVySW50ZXJmYWNlIHtcblxuICAgIGNvbnN0cnVjdG9yIChwbGF5ZXIsIG1hbmlmZXN0SGVscGVyLCBsaXZlRGVsYXkpIHtcbiAgICAgICAgdGhpcy5fcGxheWVyID0gcGxheWVyO1xuICAgICAgICB0aGlzLl9tYW5pZmVzdEhlbHBlciA9IG1hbmlmZXN0SGVscGVyO1xuICAgICAgICB0aGlzLl9saXZlRGVsYXkgPSBsaXZlRGVsYXk7XG5cbiAgICAgICAgdGhpcy5NSU5fQlVGRkVSX0xFVkVMID0gMTA7XG5cbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIHRoaXMuX29uU3RyZWFtSW5pdGlhbGl6ZWQgPSB0aGlzLl9kaXNwYXRjaEluaXRpYWxPblRyYWNrQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX3BsYXllci5vbihkYXNoanMuTWVkaWFQbGF5ZXIuZXZlbnRzLlNUUkVBTV9JTklUSUFMSVpFRCwgdGhpcy5fb25TdHJlYW1Jbml0aWFsaXplZCk7XG4gICAgfVxuXG4gICAgaXNMaXZlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21hbmlmZXN0SGVscGVyLmlzTGl2ZSgpO1xuICAgIH1cblxuICAgIGdldEJ1ZmZlckxldmVsTWF4ICgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KDAsIHRoaXMuX2xpdmVEZWxheSAtIHRoaXMuTUlOX0JVRkZFUl9MRVZFTCk7XG4gICAgfVxuXG4gICAgc2V0QnVmZmVyTWFyZ2luTGl2ZShidWZmZXJMZXZlbCkge1xuICAgICAgICB0aGlzLl9wbGF5ZXIuc2V0U3RhYmxlQnVmZmVyVGltZSh0aGlzLk1JTl9CVUZGRVJfTEVWRUwgKyBidWZmZXJMZXZlbCk7XG4gICAgICAgIHRoaXMuX3BsYXllci5zZXRCdWZmZXJUaW1lQXRUb3BRdWFsaXR5KHRoaXMuTUlOX0JVRkZFUl9MRVZFTCArIGJ1ZmZlckxldmVsKTtcbiAgICAgICAgdGhpcy5fcGxheWVyLnNldEJ1ZmZlclRpbWVBdFRvcFF1YWxpdHlMb25nRm9ybSh0aGlzLk1JTl9CVUZGRVJfTEVWRUwgKyBidWZmZXJMZXZlbCk7IC8vIFRPRE86IGNhbiBsaXZlIGJlIFwibG9uZyBmb3JtXCIgP1xuICAgIH1cblxuICAgIGFkZEV2ZW50TGlzdGVuZXIgKGV2ZW50TmFtZSwgb2JzZXJ2ZXIpIHtcbiAgICAgICAgaWYgKGV2ZW50TmFtZSAhPT0gXCJvblRyYWNrQ2hhbmdlXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJUcmllZCB0byBsaXN0ZW4gdG8gYW4gZXZlbnQgdGhhdCB3YXNuJ3Qgb25UcmFja0NoYW5nZVwiKTtcbiAgICAgICAgICAgIHJldHVybjsgIC8vIElNUE9SVEFOVDogd2UgbmVlZCB0byByZXR1cm4gdG8gYXZvaWQgZXJyb3JzIGluIF9kaXNwYXRjaEluaXRpYWxPblRyYWNrQ2hhbmdlXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgb25UcmFja0NoYW5nZUxpc3RlbmVyID0gdGhpcy5fY3JlYXRlT25UcmFja0NoYW5nZUxpc3RlbmVyKG9ic2VydmVyKTtcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzLnNldChvYnNlcnZlciwgb25UcmFja0NoYW5nZUxpc3RlbmVyKTtcblxuICAgICAgICB0aGlzLl9wbGF5ZXIub24oJ3F1YWxpdHlDaGFuZ2VkJywgb25UcmFja0NoYW5nZUxpc3RlbmVyKTsgLy9UT0RPOiBoYXJkY29kZWQgZXZlbnQgbmFtZS4gR2V0IGl0IGZyb20gZW51bVxuICAgIH1cblxuICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBvYnNlcnZlcikge1xuICAgICAgICBpZiAoZXZlbnROYW1lICE9PSBcIm9uVHJhY2tDaGFuZ2VcIikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlRyaWVkIHRvIHJlbW92ZSBsaXN0ZW5lciBmb3IgYW4gZXZlbnQgdGhhdCB3YXNuJ3Qgb25UcmFja0NoYW5nZVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvblRyYWNrQ2hhbmdlTGlzdGVuZXIgPSB0aGlzLl9saXN0ZW5lcnMuZ2V0KG9ic2VydmVyKTtcblxuICAgICAgICB0aGlzLl9wbGF5ZXIub2ZmKCdxdWFsaXR5Q2hhbmdlZCcsIG9uVHJhY2tDaGFuZ2VMaXN0ZW5lcik7IC8vVE9ETzogaGFyZGNvZGVkIGV2ZW50IG5hbWUuIEdldCBpdCBmcm9tIGVudW1cblxuICAgICAgICB0aGlzLl9saXN0ZW5lcnMuZGVsZXRlKG9ic2VydmVyKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlT25UcmFja0NoYW5nZUxpc3RlbmVyIChvYnNlcnZlcikge1xuICAgICAgICBsZXQgcGxheWVyID0gdGhpcy5fcGxheWVyO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbih7IG1lZGlhVHlwZSwgc3RyZWFtSW5mbywgb2xkUXVhbGl0eSwgbmV3UXVhbGl0eX0pIHtcbiAgICAgICAgICAgIHZhciB0cmFja3MgPSB7fTtcbiAgICAgICAgICAgIHRyYWNrc1ttZWRpYVR5cGVdID0gbmV3IFRyYWNrVmlldyh7XG4gICAgICAgICAgICAgICAgcGVyaW9kSWQ6IHN0cmVhbUluZm8uaW5kZXgsXG4gICAgICAgICAgICAgICAgYWRhcHRhdGlvblNldElkOiBwbGF5ZXIuZ2V0Q3VycmVudFRyYWNrRm9yKG1lZGlhVHlwZSkuaW5kZXgsXG4gICAgICAgICAgICAgICAgcmVwcmVzZW50YXRpb25JZDogTnVtYmVyKG5ld1F1YWxpdHkpXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgb2JzZXJ2ZXIodHJhY2tzKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfZGlzcGF0Y2hJbml0aWFsT25UcmFja0NoYW5nZSAoKSB7XG4gICAgICAgIGxldCB0cmFja3MgPSB0aGlzLl9tYW5pZmVzdEhlbHBlci5nZXRDdXJyZW50VHJhY2tzKCk7XG5cbiAgICAgICAgZm9yIChsZXQgWyBvYnNlcnZlciwgLi4ucmVzdF0gb2YgdGhpcy5fbGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBvYnNlcnZlcih0cmFja3MpO1xuICAgICAgICB9XG4gICAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXllckludGVyZmFjZTtcbiIsImltcG9ydCBFdmVudEJ1cyBmcm9tICcuLi9ub2RlX21vZHVsZXMvZGFzaGpzL3NyYy9jb3JlL0V2ZW50QnVzLmpzJztcbmltcG9ydCBFdmVudHMgZnJvbSAnLi4vbm9kZV9tb2R1bGVzL2Rhc2hqcy9zcmMvY29yZS9ldmVudHMvRXZlbnRzLmpzJztcblxuaW1wb3J0IFNlZ21lbnRWaWV3IGZyb20gJy4vU2VnbWVudFZpZXcnO1xuaW1wb3J0IFRyYWNrVmlldyBmcm9tICcuL1RyYWNrVmlldyc7XG5cbmNvbnN0IEZSQUdNRU5UX0xPQURFUl9FUlJPUl9MT0FESU5HX0ZBSUxVUkUgPSAxO1xuY29uc3QgRlJBR01FTlRfTE9BREVSX0VSUk9SX05VTExfUkVRVUVTVCA9IDI7XG5jb25zdCBGUkFHTUVOVF9MT0FERVJfTUVTU0FHRV9OVUxMX1JFUVVFU1QgPSAncmVxdWVzdCBpcyBudWxsJztcblxuZnVuY3Rpb24gU1JGcmFnbWVudExvYWRlcihjb25maWcpIHtcbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5jb250ZXh0O1xuICAgIGNvbnN0IGZhY3RvcnkgPSB0aGlzLmZhY3Rvcnk7XG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5wYXJlbnQ7XG4gICAgY29uc3QgZXZlbnRCdXMgPSBmYWN0b3J5LmdldFNpbmdsZXRvbkluc3RhbmNlKGNvbnRleHQsIFwiRXZlbnRCdXNcIik7XG5cbiAgICBjb25zdCByZXF1ZXN0TW9kaWZpZXIgPSBjb25maWcucmVxdWVzdE1vZGlmaWVyO1xuICAgIGNvbnN0IG1ldHJpY3NNb2RlbCA9IGNvbmZpZy5tZXRyaWNzTW9kZWw7XG5cbiAgICBsZXQgaW5zdGFuY2UsXG4gICAgICAgIHNyTG9hZGVyLFxuICAgICAgICBfYWJvcnQ7XG5cbiAgICBmdW5jdGlvbiBzZXR1cCgpIHtcbiAgICAgICAgaWYgKCF3aW5kb3cuc3RyZWFtcm9vdERvd25sb2FkZXIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInN0cmVhbXJvb3REb3dubG9hZGVyIGlzIG5vdCBkZWZpbmVkXCIpXG4gICAgICAgIH1cblxuICAgICAgICBzckxvYWRlciA9IHdpbmRvdy5zdHJlYW1yb290RG93bmxvYWRlcjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZ2V0U2VnbWVudFZpZXdGb3JSZXF1ZXN0KHJlcXVlc3QpIHtcbiAgICAgICAgaWYgKHJlcXVlc3QudHlwZSAhPT0gXCJJbml0aWFsaXphdGlvblNlZ21lbnRcIikge1xuICAgICAgICAgICAgbGV0IHRyYWNrVmlldyA9IG5ldyBUcmFja1ZpZXcoe1xuICAgICAgICAgICAgICAgIHBlcmlvZElkOiByZXF1ZXN0Lm1lZGlhSW5mby5zdHJlYW1JbmZvLmluZGV4LFxuICAgICAgICAgICAgICAgIGFkYXB0YXRpb25TZXRJZDogcmVxdWVzdC5tZWRpYUluZm8uaW5kZXgsXG4gICAgICAgICAgICAgICAgcmVwcmVzZW50YXRpb25JZDogcmVxdWVzdC5xdWFsaXR5XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBTZWdtZW50Vmlldyh7XG4gICAgICAgICAgICAgICAgdHJhY2tWaWV3LFxuICAgICAgICAgICAgICAgIHNlZ21lbnRJZDogTWF0aC5yb3VuZChyZXF1ZXN0LnN0YXJ0VGltZSAqIDEwKSAvL1RPRE86IGV4dHJhY3QgdGhpcyB0byBTZWdtZW50VmlldyBzdGF0aWMgbWV0aG9kXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9nZXRIZWFkZXJzRm9yUmVxdWVzdChyZXF1ZXN0KSB7XG4gICAgICAgIGxldCBoZWFkZXJzID0gW107XG4gICAgICAgIGlmIChyZXF1ZXN0LnJhbmdlKSB7XG4gICAgICAgICAgICBoZWFkZXJzLnB1c2goW1wiUmFuZ2VcIiwgJ2J5dGVzPScgKyByZXF1ZXN0LnJhbmdlXSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaGVhZGVycztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZ2V0U1JSZXF1ZXN0KHJlcXVlc3QsIGhlYWRlcnMpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHVybDogcmVxdWVzdE1vZGlmaWVyLm1vZGlmeVJlcXVlc3RVUkwocmVxdWVzdC51cmwpLFxuICAgICAgICAgICAgaGVhZGVyc1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbG9hZChyZXF1ZXN0KSB7XG5cbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgICBldmVudEJ1cy50cmlnZ2VyKEV2ZW50cy5MT0FESU5HX0NPTVBMRVRFRCwge1xuICAgICAgICAgICAgICAgIHJlcXVlc3Q6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBlcnJvcjogbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBGUkFHTUVOVF9MT0FERVJfRVJST1JfTlVMTF9SRVFVRVNULFxuICAgICAgICAgICAgICAgICAgICBGUkFHTUVOVF9MT0FERVJfTUVTU0FHRV9OVUxMX1JFUVVFU1RcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaGVhZGVycyA9IF9nZXRIZWFkZXJzRm9yUmVxdWVzdChyZXF1ZXN0KTtcbiAgICAgICAgY29uc3Qgc2VnbWVudFZpZXcgPSBfZ2V0U2VnbWVudFZpZXdGb3JSZXF1ZXN0KHJlcXVlc3QpO1xuICAgICAgICBjb25zdCBzclJlcXVlc3QgPSBfZ2V0U1JSZXF1ZXN0KHJlcXVlc3QsIGhlYWRlcnMpO1xuXG4gICAgICAgIGNvbnN0IHJlcXVlc3RTdGFydERhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBsZXQgbGFzdFRyYWNlRGF0ZSA9IHJlcXVlc3RTdGFydERhdGU7XG4gICAgICAgIGxldCBpc0ZpcnN0UHJvZ3Jlc3MgPSB0cnVlO1xuICAgICAgICBjb25zdCB0cmFjZXMgPSBbXTtcbiAgICAgICAgbGV0IGxhc3RUcmFjZVJlY2VpdmVkQ291bnQgPSAwO1xuXG4gICAgICAgIGNvbnN0IHNlbmRIdHRwUmVxdWVzdE1ldHJpYyA9IGZ1bmN0aW9uKGlzU3VjY2VzcywgcmVzcG9uc2VDb2RlKSB7XG5cbiAgICAgICAgICAgIHJlcXVlc3QucmVxdWVzdFN0YXJ0RGF0ZSA9IHJlcXVlc3RTdGFydERhdGU7XG4gICAgICAgICAgICByZXF1ZXN0LmZpcnN0Qnl0ZURhdGUgPSByZXF1ZXN0LmZpcnN0Qnl0ZURhdGUgfHwgcmVxdWVzdFN0YXJ0RGF0ZTtcbiAgICAgICAgICAgIHJlcXVlc3QucmVxdWVzdEVuZERhdGUgPSBuZXcgRGF0ZSgpO1xuXG4gICAgICAgICAgICBtZXRyaWNzTW9kZWwuYWRkSHR0cFJlcXVlc3QoXG4gICAgICAgICAgICAgICAgcmVxdWVzdC5tZWRpYVR5cGUsIC8vbWVkaWFUeXBlXG4gICAgICAgICAgICAgICAgbnVsbCwgLy90Y3BJZFxuICAgICAgICAgICAgICAgIHJlcXVlc3QudHlwZSwgLy90eXBlXG4gICAgICAgICAgICAgICAgcmVxdWVzdC51cmwsIC8vdXJsXG4gICAgICAgICAgICAgICAgbnVsbCwgLy9hY3R1YWxVcmxcbiAgICAgICAgICAgICAgICByZXF1ZXN0LnNlcnZpY2VMb2NhdGlvbiB8fCBudWxsLCAvL3NlcnZpY2VMb2NhdGlvblxuICAgICAgICAgICAgICAgIHJlcXVlc3QucmFuZ2UgfHwgbnVsbCwgLy9yYW5nZVxuICAgICAgICAgICAgICAgIHJlcXVlc3QucmVxdWVzdFN0YXJ0RGF0ZSwgLy90UmVxdWVzdFxuICAgICAgICAgICAgICAgIHJlcXVlc3QuZmlyc3RCeXRlRGF0ZSwgLy90UmVzcG9uY2VcbiAgICAgICAgICAgICAgICByZXF1ZXN0LnJlcXVlc3RFbmREYXRlLCAvL3RGaW5pc2hcbiAgICAgICAgICAgICAgICByZXNwb25zZUNvZGUsIC8vcmVzcG9uc2VDb2RlXG4gICAgICAgICAgICAgICAgcmVxdWVzdC5kdXJhdGlvbiwgLy9tZWRpYUR1cmF0aW9uXG4gICAgICAgICAgICAgICAgbnVsbCwgLy9yZXNwb25zZUhlYWRlcnNcbiAgICAgICAgICAgICAgICBpc1N1Y2Nlc3MgPyB0cmFjZXMgOiBudWxsIC8vdHJhY2VzXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgb25TdWNjZXNzID0gZnVuY3Rpb24oc2VnbWVudERhdGEsIHN0YXRzKSB7XG5cbiAgICAgICAgICAgIHNlbmRIdHRwUmVxdWVzdE1ldHJpYyh0cnVlLCAyMDApO1xuXG4gICAgICAgICAgICBldmVudEJ1cy50cmlnZ2VyKEV2ZW50cy5MT0FESU5HX0NPTVBMRVRFRCwge1xuICAgICAgICAgICAgICAgIHJlcXVlc3Q6IHJlcXVlc3QsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2U6IHNlZ21lbnREYXRhLFxuICAgICAgICAgICAgICAgIHNlbmRlcjogcGFyZW50XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBvblByb2dyZXNzID0gZnVuY3Rpb24oc3RhdHMpIHtcblxuICAgICAgICAgICAgbGV0IGN1cnJlbnREYXRlID0gbmV3IERhdGUoKTtcblxuICAgICAgICAgICAgaWYgKGlzRmlyc3RQcm9ncmVzcykge1xuICAgICAgICAgICAgICAgIGlzRmlyc3RQcm9ncmVzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJlcXVlc3QuZmlyc3RCeXRlRGF0ZSA9IGN1cnJlbnREYXRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgYnl0ZXNSZWNlaXZlZCA9IDA7XG4gICAgICAgICAgICBpZiAoc3RhdHMuY2RuRG93bmxvYWRlZCkge1xuICAgICAgICAgICAgICAgIGJ5dGVzUmVjZWl2ZWQgKz0gc3RhdHMuY2RuRG93bmxvYWRlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdGF0cy5wMnBEb3dubG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgYnl0ZXNSZWNlaXZlZCArPSBzdGF0cy5wMnBEb3dubG9hZGVkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cmFjZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgczogbGFzdFRyYWNlRGF0ZSxcbiAgICAgICAgICAgICAgICBkOiBjdXJyZW50RGF0ZS5nZXRUaW1lKCkgLSBsYXN0VHJhY2VEYXRlLmdldFRpbWUoKSxcbiAgICAgICAgICAgICAgICBiOiBbYnl0ZXNSZWNlaXZlZCA/IGJ5dGVzUmVjZWl2ZWQgLSBsYXN0VHJhY2VSZWNlaXZlZENvdW50IDogMF1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsYXN0VHJhY2VEYXRlID0gY3VycmVudERhdGU7XG4gICAgICAgICAgICBsYXN0VHJhY2VSZWNlaXZlZENvdW50ID0gYnl0ZXNSZWNlaXZlZDtcblxuICAgICAgICAgICAgZXZlbnRCdXMudHJpZ2dlcihFdmVudHMuTE9BRElOR19QUk9HUkVTUywge1xuICAgICAgICAgICAgICAgIHJlcXVlc3Q6IHJlcXVlc3RcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IG9uRXJyb3IgPSBmdW5jdGlvbih4aHJFdmVudCkge1xuXG4gICAgICAgICAgICBzZW5kSHR0cFJlcXVlc3RNZXRyaWMoZmFsc2UsIHhockV2ZW50LnRhcmdldC5zdGF0dXMpO1xuXG4gICAgICAgICAgICBldmVudEJ1cy50cmlnZ2VyKEV2ZW50cy5MT0FESU5HX0NPTVBMRVRFRCwge1xuICAgICAgICAgICAgICAgIHJlcXVlc3Q6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBlcnJvcjogbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBGUkFHTUVOVF9MT0FERVJfRVJST1JfTE9BRElOR19GQUlMVVJFLFxuICAgICAgICAgICAgICAgICAgICBcImZhaWxlZCBsb2FkaW5nIGZyYWdtZW50XCJcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBfYWJvcnQgPSBzckxvYWRlci5nZXRTZWdtZW50KFxuICAgICAgICAgICAgc3JSZXF1ZXN0LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG9uU3VjY2VzcyxcbiAgICAgICAgICAgICAgICBvblByb2dyZXNzLFxuICAgICAgICAgICAgICAgIG9uRXJyb3JcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZWdtZW50Vmlld1xuICAgICAgICApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFib3J0KCkge1xuICAgICAgICBpZiAoX2Fib3J0KSB7XG4gICAgICAgICAgICBfYWJvcnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgICAgICBhYm9ydCgpO1xuICAgIH1cblxuICAgIGluc3RhbmNlID0ge1xuICAgICAgICBsb2FkOiBsb2FkLFxuICAgICAgICBhYm9ydDogYWJvcnQsXG4gICAgICAgIHJlc2V0OiByZXNldFxuICAgIH07XG5cbiAgICBzZXR1cCgpO1xuXG4gICAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBTUkZyYWdtZW50TG9hZGVyO1xuIiwiaW1wb3J0IFRyYWNrVmlldyBmcm9tICcuL1RyYWNrVmlldyc7XG5cbmNsYXNzIFNlZ21lbnRWaWV3IHtcblxuICAvKipcbiAgKiBAcGFyYW0gYXJyYXlCdWZmZXIge0FycmF5QnVmZmVyfVxuICAqIEByZXR1cm5zIHtTZWdtZW50Vmlld31cbiAgKi9cbiAgc3RhdGljIGZyb21BcnJheUJ1ZmZlcihhcnJheUJ1ZmZlcil7XG4gICAgdmFyIHUzMkRhdGEgPSBuZXcgVWludDMyQXJyYXkoYXJyYXlCdWZmZXIpLFxuICAgICAgICBbIHBlcmlvZElkLCBhZGFwdGF0aW9uU2V0SWQsIHJlcHJlc2VudGF0aW9uSWQsIHNlZ21lbnRJZCBdID0gdTMyRGF0YTtcbiAgICByZXR1cm4gbmV3IFNlZ21lbnRWaWV3KHtcbiAgICAgIHRyYWNrVmlldzogbmV3IFRyYWNrVmlldyh7IHBlcmlvZElkLCBhZGFwdGF0aW9uU2V0SWQsIHJlcHJlc2VudGF0aW9uSWQgfSksXG4gICAgICBzZWdtZW50SWRcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdFxuICAgICovXG4gIGNvbnN0cnVjdG9yKG9iail7XG4gICAgdGhpcy5zZWdtZW50SWQgPSBvYmouc2VnbWVudElkO1xuICAgIHRoaXMudHJhY2tWaWV3ID0gbmV3IFRyYWNrVmlldyhvYmoudHJhY2tWaWV3KTtcbiAgfVxuXG4gIC8qKlxuICAgICogRGV0ZXJtaW5lcyBpZiBhIHNlZ21lbnQgcmVwcmVzZW50IHRoZSBzYW1lIG1lZGlhIGNodW5rIHRoYW4gYW5vdGhlciBzZWdtZW50XG4gICAgKiBAcGFyYW0gc2VnbWVudFZpZXcge1NlZ21lbnRWaWV3fVxuICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgKi9cbiAgaXNFcXVhbChzZWdtZW50Vmlldykge1xuICAgIGlmKCFzZWdtZW50Vmlldyl7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGxldCB7c2VnbWVudElkLCB0cmFja1ZpZXd9ID0gc2VnbWVudFZpZXc7XG4gICAgcmV0dXJuIHRoaXMuc2VnbWVudElkID09PSBzZWdtZW50SWQgJiYgdGhpcy50cmFja1ZpZXcuaXNFcXVhbCh0cmFja1ZpZXcpO1xuICB9XG5cbiAgLyoqXG4gICAgKiBAcGFyYW0gdHJhY2tWaWV3IHtUcmFja1ZpZXd9XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAqL1xuICBpc0luVHJhY2sodHJhY2tWaWV3KSB7XG4gICAgcmV0dXJuIHRoaXMudHJhY2tWaWV3LmlzRXF1YWwodHJhY2tWaWV3KTtcbiAgfVxuXG4gIC8qKlxuICAgICogQHJldHVybnMge1N0cmluZ31cbiAgICAqL1xuICB2aWV3VG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIGAke3RoaXMudHJhY2tWaWV3LnZpZXdUb1N0cmluZygpfVMke3RoaXMuc2VnbWVudElkfWA7XG4gIH1cblxuICAvKipcbiAgICAqIEByZXR1cm5zIHtBcnJheUJ1ZmZlcn1cbiAgICAqL1xuICB0b0FycmF5QnVmZmVyKCkge1xuICAgIHJldHVybiBuZXcgVWludDMyQXJyYXkoW3RoaXMudHJhY2tWaWV3LnBlcmlvZElkLCB0aGlzLnRyYWNrVmlldy5hZGFwdGF0aW9uU2V0SWQsIHRoaXMudHJhY2tWaWV3LnJlcHJlc2VudGF0aW9uSWQsIHRoaXMuc2VnbWVudElkXSkuYnVmZmVyO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNlZ21lbnRWaWV3O1xuIiwiaW1wb3J0IFRyYWNrVmlldyBmcm9tICcuL1RyYWNrVmlldyc7XG5cbmNsYXNzIFNlZ21lbnRzQ2FjaGUge1xuXG4gICAgY29uc3RydWN0b3IocGxheWVyKSB7XG4gICAgICAgIHRoaXMuX3BsYXllciA9IHBsYXllcjtcbiAgICAgICAgdGhpcy5fcGxheWVyLm9uKCdzZWdtZW50c0xvYWRlZCcsIHRoaXMuX29uU2VnbWVudHNMb2FkZWQsIHRoaXMpO1xuXG4gICAgICAgIC8vVE9ETzogY2hlY2sgaWYgY2FjaGUgc2hvdWxkIGJlIGZsdXNoZWQgb24gcGxheWVyJ3MgJ3JlcHJlc2VudGF0aW9uVXBkYXRlZCcgZXZlbnRcbiAgICAgICAgdGhpcy5fY2FjaGUgPSB7fTtcbiAgICB9XG5cbiAgICBfb25TZWdtZW50c0xvYWRlZChldmVudCkge1xuICAgICAgICBsZXQgc2VnbWVudHMgPSBldmVudC5zZWdtZW50cztcbiAgICAgICAgbGV0IHRyYWNrVmlld0lkID0gVHJhY2tWaWV3Lm1ha2VJRFN0cmluZyhcbiAgICAgICAgICAgIGV2ZW50LnJlcHJlc2VudGF0aW9uLmFkYXB0YXRpb24ucGVyaW9kLmluZGV4LFxuICAgICAgICAgICAgZXZlbnQucmVwcmVzZW50YXRpb24uYWRhcHRhdGlvbi5pbmRleCxcbiAgICAgICAgICAgIGV2ZW50LnJlcHJlc2VudGF0aW9uLmluZGV4XG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5fY2FjaGVbdHJhY2tWaWV3SWRdID0gc2VnbWVudHM7XG4gICAgfTtcblxuICAgIGhhc1NlZ21lbnRzKHRyYWNrVmlldykge1xuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVbdHJhY2tWaWV3LnZpZXdUb1N0cmluZygpXSAhPT0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGdldFNlZ21lbnRzKHRyYWNrVmlldykge1xuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVbdHJhY2tWaWV3LnZpZXdUb1N0cmluZygpXTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2VnbWVudHNDYWNoZTtcbiIsIi8vanNoaW50IC1XMDk4XG5jbGFzcyBUcmFja1ZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKG9iaikge1xuICAgIHRoaXMucGVyaW9kSWQgPSBvYmoucGVyaW9kSWQ7XG4gICAgdGhpcy5hZGFwdGF0aW9uU2V0SWQgPSBvYmouYWRhcHRhdGlvblNldElkO1xuICAgIHRoaXMucmVwcmVzZW50YXRpb25JZCA9IG9iai5yZXByZXNlbnRhdGlvbklkO1xuICB9XG5cbiAgc3RhdGljIG1ha2VJRFN0cmluZyhwZXJpb2RJZCwgYWRhcHRhdGlvblNldElkLCByZXByZXNlbnRhdGlvbklkKSB7XG4gICAgcmV0dXJuIGBQJHtwZXJpb2RJZH1BJHthZGFwdGF0aW9uU2V0SWR9UiR7cmVwcmVzZW50YXRpb25JZH1gO1xuICB9XG5cbiAgLyoqXG4gICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICovXG4gIHZpZXdUb1N0cmluZygpIHtcbiAgICByZXR1cm4gVHJhY2tWaWV3Lm1ha2VJRFN0cmluZyh0aGlzLnBlcmlvZElkLCB0aGlzLmFkYXB0YXRpb25TZXRJZCwgdGhpcy5yZXByZXNlbnRhdGlvbklkKTtcbiAgfVxuXG4gIC8qKlxuICAgICogQHBhcmFtIHRyYWNrVmlldyB7VHJhY2tWaWV3fVxuICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgKi9cbiAgaXNFcXVhbCh0cmFja1ZpZXcpe1xuICAgIHJldHVybiAhIXRyYWNrVmlldyAmJlxuICAgICAgICB0aGlzLnBlcmlvZElkID09PSB0cmFja1ZpZXcucGVyaW9kSWQgJiZcbiAgICAgICAgdGhpcy5hZGFwdGF0aW9uU2V0SWQgPT09IHRyYWNrVmlldy5hZGFwdGF0aW9uU2V0SWQgJiZcbiAgICAgICAgdGhpcy5yZXByZXNlbnRhdGlvbklkID09PSB0cmFja1ZpZXcucmVwcmVzZW50YXRpb25JZDtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUcmFja1ZpZXc7XG4iLCIvKipcbiAqIFRoZSBjb3B5cmlnaHQgaW4gdGhpcyBzb2Z0d2FyZSBpcyBiZWluZyBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgQlNEIExpY2Vuc2UsXG4gKiBpbmNsdWRlZCBiZWxvdy4gVGhpcyBzb2Z0d2FyZSBtYXkgYmUgc3ViamVjdCB0byBvdGhlciB0aGlyZCBwYXJ0eSBhbmQgY29udHJpYnV0b3JcbiAqIHJpZ2h0cywgaW5jbHVkaW5nIHBhdGVudCByaWdodHMsIGFuZCBubyBzdWNoIHJpZ2h0cyBhcmUgZ3JhbnRlZCB1bmRlciB0aGlzIGxpY2Vuc2UuXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEzLCBEYXNoIEluZHVzdHJ5IEZvcnVtLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuICogYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuICogICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gKiAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gKiAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3JcbiAqICBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuICogICogTmVpdGhlciB0aGUgbmFtZSBvZiBEYXNoIEluZHVzdHJ5IEZvcnVtIG5vciB0aGUgbmFtZXMgb2YgaXRzXG4gKiAgY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZVxuICogIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuICpcbiAqICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIEFTIElTIEFORCBBTllcbiAqICBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG4gKiAgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELlxuICogIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsXG4gKiAgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVFxuICogIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1JcbiAqICBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSxcbiAqICBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpXG4gKiAgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEVcbiAqICBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAqL1xuaW1wb3J0IEZhY3RvcnlNYWtlciBmcm9tICcuL0ZhY3RvcnlNYWtlci5qcyc7XG5cbmZ1bmN0aW9uIEV2ZW50QnVzKCkge1xuXG4gICAgbGV0IGluc3RhbmNlO1xuICAgIGxldCBoYW5kbGVycyA9IHt9O1xuXG5cbiAgICBmdW5jdGlvbiBvbih0eXBlLCBsaXN0ZW5lciwgc2NvcGUpIHtcbiAgICAgICAgaWYgKCF0eXBlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2V2ZW50IHR5cGUgY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWxpc3RlbmVyIHx8IHR5cGVvZiAobGlzdGVuZXIpICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbjogJyArIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChnZXRIYW5kbGVySWR4KHR5cGUsIGxpc3RlbmVyLCBzY29wZSkgPj0gMCkgcmV0dXJuO1xuXG4gICAgICAgIHZhciBoYW5kbGVyID0ge1xuICAgICAgICAgICAgY2FsbGJhY2s6IGxpc3RlbmVyLFxuICAgICAgICAgICAgc2NvcGU6IHNjb3BlXG4gICAgICAgIH07XG5cbiAgICAgICAgaGFuZGxlcnNbdHlwZV0gPSBoYW5kbGVyc1t0eXBlXSB8fCBbXTtcbiAgICAgICAgaGFuZGxlcnNbdHlwZV0ucHVzaChoYW5kbGVyKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvZmYodHlwZSwgbGlzdGVuZXIsIHNjb3BlKSB7XG4gICAgICAgIGlmICghdHlwZSB8fCAhbGlzdGVuZXIgfHwgIWhhbmRsZXJzW3R5cGVdKSByZXR1cm47XG5cbiAgICAgICAgdmFyIGlkeCA9IGdldEhhbmRsZXJJZHgodHlwZSwgbGlzdGVuZXIsIHNjb3BlKTtcblxuICAgICAgICBpZiAoaWR4IDwgMCkgcmV0dXJuO1xuXG4gICAgICAgIGhhbmRsZXJzW3R5cGVdLnNwbGljZShpZHgsIDEpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRyaWdnZXIodHlwZSwgYXJncykge1xuICAgICAgICBpZiAoIXR5cGUgfHwgIWhhbmRsZXJzW3R5cGVdKSByZXR1cm47XG5cbiAgICAgICAgYXJncyA9IGFyZ3MgfHwge307XG5cbiAgICAgICAgaWYgKGFyZ3MuaGFzT3duUHJvcGVydHkoJ3R5cGUnKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdcXCd0eXBlXFwnIGlzIGEgcmVzZXJ2ZWQgd29yZCBmb3IgZXZlbnQgZGlzcGF0Y2hpbmcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFyZ3MudHlwZSA9IHR5cGU7XG5cbiAgICAgICAgaGFuZGxlcnNbdHlwZV0uZm9yRWFjaChmdW5jdGlvbiAoaGFuZGxlcikge1xuICAgICAgICAgICAgaGFuZGxlci5jYWxsYmFjay5jYWxsKGhhbmRsZXIuc2NvcGUsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgICAgaGFuZGxlcnMgPSB7fTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRIYW5kbGVySWR4KHR5cGUsIGxpc3RlbmVyLCBzY29wZSkge1xuICAgICAgICB2YXIgaGFuZGxlcnNGb3JUeXBlID0gaGFuZGxlcnNbdHlwZV07XG4gICAgICAgIHZhciByZXN1bHQgPSAtMTtcblxuICAgICAgICBpZiAoIWhhbmRsZXJzRm9yVHlwZSB8fCBoYW5kbGVyc0ZvclR5cGUubGVuZ3RoID09PSAwKSByZXR1cm4gcmVzdWx0O1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGFuZGxlcnNGb3JUeXBlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaGFuZGxlcnNGb3JUeXBlW2ldLmNhbGxiYWNrID09PSBsaXN0ZW5lciAmJiAoIXNjb3BlIHx8IHNjb3BlID09PSBoYW5kbGVyc0ZvclR5cGVbaV0uc2NvcGUpKSByZXR1cm4gaTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgaW5zdGFuY2UgPSB7XG4gICAgICAgIG9uOiBvbixcbiAgICAgICAgb2ZmOiBvZmYsXG4gICAgICAgIHRyaWdnZXI6IHRyaWdnZXIsXG4gICAgICAgIHJlc2V0OiByZXNldFxuICAgIH07XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbkV2ZW50QnVzLl9fZGFzaGpzX2ZhY3RvcnlfbmFtZSA9ICdFdmVudEJ1cyc7XG5leHBvcnQgZGVmYXVsdCBGYWN0b3J5TWFrZXIuZ2V0U2luZ2xldG9uRmFjdG9yeShFdmVudEJ1cyk7IiwiLyoqXG4gKiBUaGUgY29weXJpZ2h0IGluIHRoaXMgc29mdHdhcmUgaXMgYmVpbmcgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBMaWNlbnNlLFxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICogIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xuICogIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBBUyBJUyBBTkQgQU5ZXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cbiAqICBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULFxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXG4gKiAgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXG4gKiAgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cbi8qKlxuICogQE1vZHVsZSBGYWN0b3J5TWFrZXJcbiAqL1xubGV0IEZhY3RvcnlNYWtlciA9IChmdW5jdGlvbiAoKSB7XG5cbiAgICBsZXQgaW5zdGFuY2U7XG4gICAgbGV0IGV4dGVuc2lvbnMgPSBbXTtcbiAgICBsZXQgc2luZ2xldG9uQ29udGV4dHMgPSBbXTtcblxuICAgIGZ1bmN0aW9uIGV4dGVuZChuYW1lLCBjaGlsZEluc3RhbmNlLCBvdmVycmlkZSwgY29udGV4dCkge1xuICAgICAgICBsZXQgZXh0ZW5zaW9uQ29udGV4dCA9IGdldEV4dGVuc2lvbkNvbnRleHQoY29udGV4dCk7XG4gICAgICAgIGlmICghZXh0ZW5zaW9uQ29udGV4dFtuYW1lXSAmJiBjaGlsZEluc3RhbmNlKSB7XG4gICAgICAgICAgICBleHRlbnNpb25Db250ZXh0W25hbWVdID0ge2luc3RhbmNlOiBjaGlsZEluc3RhbmNlLCBvdmVycmlkZTogb3ZlcnJpZGV9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgbWV0aG9kIGZyb20geW91ciBleHRlbmRlZCBvYmplY3QuICB0aGlzLmZhY3RvcnkgaXMgaW5qZWN0ZWQgaW50byB5b3VyIG9iamVjdC5cbiAgICAgKiB0aGlzLmZhY3RvcnkuZ2V0U2luZ2xldG9uSW5zdGFuY2UodGhpcy5jb250ZXh0LCAnVmlkZW9Nb2RlbCcpXG4gICAgICogd2lsbCByZXR1cm4gdGhlIHZpZGVvIG1vZGVsIGZvciB1c2UgaW4gdGhlIGV4dGVuZGVkIG9iamVjdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBjb250ZXh0IHtPYmplY3R9IGluamVjdGVkIGludG8gZXh0ZW5kZWQgb2JqZWN0IGFzIHRoaXMuY29udGV4dFxuICAgICAqIEBwYXJhbSBjbGFzc05hbWUge1N0cmluZ30gc3RyaW5nIG5hbWUgZm91bmQgaW4gYWxsIGRhc2guanMgb2JqZWN0c1xuICAgICAqIHdpdGggbmFtZSBfX2Rhc2hqc19mYWN0b3J5X25hbWUgV2lsbCBiZSBhdCB0aGUgYm90dG9tLiBXaWxsIGJlIHRoZSBzYW1lIGFzIHRoZSBvYmplY3QncyBuYW1lLlxuICAgICAqIEByZXR1cm5zIHsqfSBDb250ZXh0IGF3YXJlIGluc3RhbmNlIG9mIHNwZWNpZmllZCBzaW5nbGV0b24gbmFtZS5cbiAgICAgKiBAbWVtYmVyb2YgbW9kdWxlOkZhY3RvcnlNYWtlclxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldFNpbmdsZXRvbkluc3RhbmNlKGNvbnRleHQsIGNsYXNzTmFtZSkge1xuICAgICAgICBmb3IgKGxldCBpIGluIHNpbmdsZXRvbkNvbnRleHRzKSB7XG4gICAgICAgICAgICBsZXQgb2JqID0gc2luZ2xldG9uQ29udGV4dHNbaV07XG4gICAgICAgICAgICBpZiAob2JqLmNvbnRleHQgPT09IGNvbnRleHQgJiYgb2JqLm5hbWUgPT09IGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvYmouaW5zdGFuY2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXNlIHRoaXMgbWV0aG9kIHRvIGFkZCBhbiBzaW5nbGV0b24gaW5zdGFuY2UgdG8gdGhlIHN5c3RlbS4gIFVzZWZ1bCBmb3IgdW5pdCB0ZXN0aW5nIHRvIG1vY2sgb2JqZWN0cyBldGMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY29udGV4dFxuICAgICAqIEBwYXJhbSBjbGFzc05hbWVcbiAgICAgKiBAcGFyYW0gaW5zdGFuY2VcbiAgICAgKiBAbWVtYmVyb2YgbW9kdWxlOkZhY3RvcnlNYWtlclxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNldFNpbmdsZXRvbkluc3RhbmNlKGNvbnRleHQsIGNsYXNzTmFtZSwgaW5zdGFuY2UpIHtcbiAgICAgICAgZm9yIChsZXQgaSBpbiBzaW5nbGV0b25Db250ZXh0cykge1xuICAgICAgICAgICAgbGV0IG9iaiA9IHNpbmdsZXRvbkNvbnRleHRzW2ldO1xuICAgICAgICAgICAgaWYgKG9iai5jb250ZXh0ID09PSBjb250ZXh0ICYmIG9iai5uYW1lID09PSBjbGFzc05hbWUpIHtcbiAgICAgICAgICAgICAgICBzaW5nbGV0b25Db250ZXh0c1tpXS5pbnN0YW5jZSA9IGluc3RhbmNlO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzaW5nbGV0b25Db250ZXh0cy5wdXNoKHsgbmFtZTogY2xhc3NOYW1lLCBjb250ZXh0OiBjb250ZXh0LCBpbnN0YW5jZTogaW5zdGFuY2UgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Q2xhc3NGYWN0b3J5KGNsYXNzQ29uc3RydWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgICAgICAgICBpZiAoY29udGV4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lcmdlKGNsYXNzQ29uc3RydWN0b3IuX19kYXNoanNfZmFjdG9yeV9uYW1lLCBjbGFzc0NvbnN0cnVjdG9yLmFwcGx5KHsgY29udGV4dDogY29udGV4dCB9LCBhcmd1bWVudHMpLCBjb250ZXh0LCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0U2luZ2xldG9uRmFjdG9yeShjbGFzc0NvbnN0cnVjdG9yKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgICAgICAgICAgbGV0IGluc3RhbmNlO1xuICAgICAgICAgICAgaWYgKGNvbnRleHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZ2V0SW5zdGFuY2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhbiBpbnN0YW5jZSB5ZXQgY2hlY2sgZm9yIG9uZSBvbiB0aGUgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICBpZiAoIWluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IGdldFNpbmdsZXRvbkluc3RhbmNlKGNvbnRleHQsIGNsYXNzQ29uc3RydWN0b3IuX19kYXNoanNfZmFjdG9yeV9uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSdzIG5vIGluc3RhbmNlIG9uIHRoZSBjb250ZXh0IHRoZW4gY3JlYXRlIG9uZVxuICAgICAgICAgICAgICAgICAgICBpZiAoIWluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IG1lcmdlKGNsYXNzQ29uc3RydWN0b3IuX19kYXNoanNfZmFjdG9yeV9uYW1lLCBjbGFzc0NvbnN0cnVjdG9yLmFwcGx5KHsgY29udGV4dDogY29udGV4dCB9LCBhcmd1bWVudHMpLCBjb250ZXh0LCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2luZ2xldG9uQ29udGV4dHMucHVzaCh7IG5hbWU6IGNsYXNzQ29uc3RydWN0b3IuX19kYXNoanNfZmFjdG9yeV9uYW1lLCBjb250ZXh0OiBjb250ZXh0LCBpbnN0YW5jZTogaW5zdGFuY2UgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWVyZ2UobmFtZSwgY2xhc3NDb25zdHJ1Y3RvciwgY29udGV4dCwgYXJncykge1xuICAgICAgICBsZXQgZXh0ZW5zaW9uQ29udGV4dCA9IGdldEV4dGVuc2lvbkNvbnRleHQoY29udGV4dCk7XG4gICAgICAgIGxldCBleHRlbnNpb25PYmplY3QgPSBleHRlbnNpb25Db250ZXh0W25hbWVdO1xuICAgICAgICBpZiAoZXh0ZW5zaW9uT2JqZWN0KSB7XG4gICAgICAgICAgICBsZXQgZXh0ZW5zaW9uID0gZXh0ZW5zaW9uT2JqZWN0Lmluc3RhbmNlO1xuICAgICAgICAgICAgaWYgKGV4dGVuc2lvbk9iamVjdC5vdmVycmlkZSkgeyAvL092ZXJyaWRlIHB1YmxpYyBtZXRob2RzIGluIHBhcmVudCBidXQga2VlcCBwYXJlbnQuXG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9uID0gZXh0ZW5zaW9uLmFwcGx5KHsgY29udGV4dDogY29udGV4dCwgZmFjdG9yeTogaW5zdGFuY2UsIHBhcmVudDogY2xhc3NDb25zdHJ1Y3Rvcn0sIGFyZ3MpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcHJvcCBpbiBleHRlbnNpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNsYXNzQ29uc3RydWN0b3IuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzQ29uc3RydWN0b3JbcHJvcF0gPSBleHRlbnNpb25bcHJvcF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgeyAvL3JlcGxhY2UgcGFyZW50IG9iamVjdCBjb21wbGV0ZWx5IHdpdGggbmV3IG9iamVjdC4gU2FtZSBhcyBkaWpvbi5cbiAgICAgICAgICAgICAgICByZXR1cm4gZXh0ZW5zaW9uLmFwcGx5KHsgY29udGV4dDogY29udGV4dCwgZmFjdG9yeTogaW5zdGFuY2V9LCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2xhc3NDb25zdHJ1Y3RvcjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRFeHRlbnNpb25Db250ZXh0KGNvbnRleHQpIHtcbiAgICAgICAgbGV0IGV4dGVuc2lvbkNvbnRleHQ7XG4gICAgICAgIGV4dGVuc2lvbnMuZm9yRWFjaChmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICBpZiAob2JqID09PSBjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9uQ29udGV4dCA9IG9iajtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghZXh0ZW5zaW9uQ29udGV4dCkge1xuICAgICAgICAgICAgZXh0ZW5zaW9uQ29udGV4dCA9IGV4dGVuc2lvbnMucHVzaChjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXh0ZW5zaW9uQ29udGV4dDtcbiAgICB9XG5cbiAgICBpbnN0YW5jZSA9IHtcbiAgICAgICAgZXh0ZW5kOiBleHRlbmQsXG4gICAgICAgIGdldFNpbmdsZXRvbkluc3RhbmNlOiBnZXRTaW5nbGV0b25JbnN0YW5jZSxcbiAgICAgICAgc2V0U2luZ2xldG9uSW5zdGFuY2U6IHNldFNpbmdsZXRvbkluc3RhbmNlLFxuICAgICAgICBnZXRTaW5nbGV0b25GYWN0b3J5OiBnZXRTaW5nbGV0b25GYWN0b3J5LFxuICAgICAgICBnZXRDbGFzc0ZhY3Rvcnk6IGdldENsYXNzRmFjdG9yeVxuICAgIH07XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG5cbn0oKSk7XG5cbmV4cG9ydCBkZWZhdWx0IEZhY3RvcnlNYWtlcjsiLCIvKipcbiAqIFRoZSBjb3B5cmlnaHQgaW4gdGhpcyBzb2Z0d2FyZSBpcyBiZWluZyBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgQlNEIExpY2Vuc2UsXG4gKiBpbmNsdWRlZCBiZWxvdy4gVGhpcyBzb2Z0d2FyZSBtYXkgYmUgc3ViamVjdCB0byBvdGhlciB0aGlyZCBwYXJ0eSBhbmQgY29udHJpYnV0b3JcbiAqIHJpZ2h0cywgaW5jbHVkaW5nIHBhdGVudCByaWdodHMsIGFuZCBubyBzdWNoIHJpZ2h0cyBhcmUgZ3JhbnRlZCB1bmRlciB0aGlzIGxpY2Vuc2UuXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEzLCBEYXNoIEluZHVzdHJ5IEZvcnVtLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuICogYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuICogICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gKiAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gKiAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3JcbiAqICBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuICogICogTmVpdGhlciB0aGUgbmFtZSBvZiBEYXNoIEluZHVzdHJ5IEZvcnVtIG5vciB0aGUgbmFtZXMgb2YgaXRzXG4gKiAgY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZVxuICogIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuICpcbiAqICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIEFTIElTIEFORCBBTllcbiAqICBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEXG4gKiAgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELlxuICogIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsXG4gKiAgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVFxuICogIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1JcbiAqICBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSxcbiAqICBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpXG4gKiAgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEVcbiAqICBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAqL1xuaW1wb3J0IEV2ZW50c0Jhc2UgZnJvbSAnLi9FdmVudHNCYXNlLmpzJztcblxuLyoqXG4gKiBAY2xhc3NcbiAqIEBpZ25vcmVcbiAqL1xuY2xhc3MgQ29yZUV2ZW50cyBleHRlbmRzIEV2ZW50c0Jhc2Uge1xuICAgIGNvbnN0cnVjdG9yICgpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5BU1RfSU5fRlVUVVJFID0gJ2FzdGluZnV0dXJlJztcbiAgICAgICAgdGhpcy5CVUZGRVJJTkdfQ09NUExFVEVEID0gJ2J1ZmZlcmluZ0NvbXBsZXRlZCc7XG4gICAgICAgIHRoaXMuQlVGRkVSX0NMRUFSRUQgPSAnYnVmZmVyQ2xlYXJlZCc7XG4gICAgICAgIHRoaXMuQlVGRkVSX0xFVkVMX1NUQVRFX0NIQU5HRUQgPSAnYnVmZmVyU3RhdGVDaGFuZ2VkJztcbiAgICAgICAgdGhpcy5CVUZGRVJfTEVWRUxfVVBEQVRFRCA9ICdidWZmZXJMZXZlbFVwZGF0ZWQnO1xuICAgICAgICB0aGlzLkJZVEVTX0FQUEVOREVEID0gJ2J5dGVzQXBwZW5kZWQnO1xuICAgICAgICB0aGlzLkNIRUNLX0ZPUl9FWElTVEVOQ0VfQ09NUExFVEVEID0gJ2NoZWNrRm9yRXhpc3RlbmNlQ29tcGxldGVkJztcbiAgICAgICAgdGhpcy5DSFVOS19BUFBFTkRFRCA9ICdjaHVua0FwcGVuZGVkJztcbiAgICAgICAgdGhpcy5DVVJSRU5UX1RSQUNLX0NIQU5HRUQgPSAnY3VycmVudHRyYWNrY2hhbmdlZCc7XG4gICAgICAgIHRoaXMuREFUQV9VUERBVEVfQ09NUExFVEVEID0gJ2RhdGFVcGRhdGVDb21wbGV0ZWQnO1xuICAgICAgICB0aGlzLkRBVEFfVVBEQVRFX1NUQVJURUQgPSAnZGF0YVVwZGF0ZVN0YXJ0ZWQnO1xuICAgICAgICB0aGlzLkZSQUdNRU5UX0xPQURJTkdfQ09NUExFVEVEID0gJ2ZyYWdtZW50TG9hZGluZ0NvbXBsZXRlZCc7XG4gICAgICAgIHRoaXMuRlJBR01FTlRfTE9BRElOR19TVEFSVEVEID0gJ2ZyYWdtZW50TG9hZGluZ1N0YXJ0ZWQnO1xuICAgICAgICB0aGlzLklOSVRJQUxJWkFUSU9OX0xPQURFRCA9ICdpbml0aWFsaXphdGlvbkxvYWRlZCc7XG4gICAgICAgIHRoaXMuSU5JVF9GUkFHTUVOVF9MT0FERUQgPSAnaW5pdEZyYWdtZW50TG9hZGVkJztcbiAgICAgICAgdGhpcy5JTklUX1JFUVVFU1RFRCA9ICdpbml0UmVxdWVzdGVkJztcbiAgICAgICAgdGhpcy5JTlRFUk5BTF9NQU5JRkVTVF9MT0FERUQgPSAnaW50ZXJuYWxNYW5pZmVzdExvYWRlZCc7XG4gICAgICAgIHRoaXMuTElWRV9FREdFX1NFQVJDSF9DT01QTEVURUQgPSAnbGl2ZUVkZ2VTZWFyY2hDb21wbGV0ZWQnO1xuICAgICAgICB0aGlzLkxPQURJTkdfQ09NUExFVEVEID0gJ2xvYWRpbmdDb21wbGV0ZWQnO1xuICAgICAgICB0aGlzLkxPQURJTkdfUFJPR1JFU1MgPSAnbG9hZGluZ1Byb2dyZXNzJztcbiAgICAgICAgdGhpcy5NQU5JRkVTVF9VUERBVEVEID0gJ21hbmlmZXN0VXBkYXRlZCc7XG4gICAgICAgIHRoaXMuTUVESUFfRlJBR01FTlRfTE9BREVEID0gJ21lZGlhRnJhZ21lbnRMb2FkZWQnO1xuICAgICAgICB0aGlzLlFVQUxJVFlfQ0hBTkdFRCA9ICdxdWFsaXR5Q2hhbmdlZCc7XG4gICAgICAgIHRoaXMuUVVPVEFfRVhDRUVERUQgPSAncXVvdGFFeGNlZWRlZCc7XG4gICAgICAgIHRoaXMuUkVQUkVTRU5UQVRJT05fVVBEQVRFRCA9ICdyZXByZXNlbnRhdGlvblVwZGF0ZWQnO1xuICAgICAgICB0aGlzLlNFR01FTlRTX0xPQURFRCA9ICdzZWdtZW50c0xvYWRlZCc7XG4gICAgICAgIHRoaXMuU09VUkNFQlVGRkVSX0FQUEVORF9DT01QTEVURUQgPSAnc291cmNlQnVmZmVyQXBwZW5kQ29tcGxldGVkJztcbiAgICAgICAgdGhpcy5TT1VSQ0VCVUZGRVJfUkVNT1ZFX0NPTVBMRVRFRCA9ICdzb3VyY2VCdWZmZXJSZW1vdmVDb21wbGV0ZWQnO1xuICAgICAgICB0aGlzLlNUUkVBTVNfQ09NUE9TRUQgPSAnc3RyZWFtc0NvbXBvc2VkJztcbiAgICAgICAgdGhpcy5TVFJFQU1fQlVGRkVSSU5HX0NPTVBMRVRFRCA9ICdzdHJlYW1CdWZmZXJpbmdDb21wbGV0ZWQnO1xuICAgICAgICB0aGlzLlNUUkVBTV9DT01QTEVURUQgPSAnc3RyZWFtQ29tcGxldGVkJztcbiAgICAgICAgdGhpcy5TVFJFQU1fSU5JVElBTElaRUQgPSAnc3RyZWFtaW5pdGlhbGl6ZWQnO1xuICAgICAgICB0aGlzLlNUUkVBTV9URUFSRE9XTl9DT01QTEVURSA9ICdzdHJlYW1UZWFyZG93bkNvbXBsZXRlJztcbiAgICAgICAgdGhpcy5USU1FRF9URVhUX1JFUVVFU1RFRCA9ICd0aW1lZFRleHRSZXF1ZXN0ZWQnO1xuICAgICAgICB0aGlzLlRJTUVfU1lOQ0hST05JWkFUSU9OX0NPTVBMRVRFRCA9ICd0aW1lU3luY2hyb25pemF0aW9uQ29tcGxldGUnO1xuICAgICAgICB0aGlzLldBTExDTE9DS19USU1FX1VQREFURUQgPSAnd2FsbGNsb2NrVGltZVVwZGF0ZWQnO1xuICAgICAgICB0aGlzLlhMSU5LX0FMTF9FTEVNRU5UU19MT0FERUQgPSAneGxpbmtBbGxFbGVtZW50c0xvYWRlZCc7XG4gICAgICAgIHRoaXMuWExJTktfRUxFTUVOVF9MT0FERUQgPSAneGxpbmtFbGVtZW50TG9hZGVkJztcbiAgICAgICAgdGhpcy5YTElOS19SRUFEWSA9ICd4bGlua1JlYWR5JztcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvcmVFdmVudHM7IiwiLyoqXG4gKiBUaGUgY29weXJpZ2h0IGluIHRoaXMgc29mdHdhcmUgaXMgYmVpbmcgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBMaWNlbnNlLFxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICogIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xuICogIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBBUyBJUyBBTkQgQU5ZXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cbiAqICBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULFxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXG4gKiAgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXG4gKiAgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cbi8qKlxuICogQGNsYXNzXG4gKiBAaWdub3JlXG4gKi9cbmltcG9ydCBDb3JlRXZlbnRzIGZyb20gJy4vQ29yZUV2ZW50cy5qcyc7XG5jbGFzcyBFdmVudHMgZXh0ZW5kcyBDb3JlRXZlbnRzIHtcbn1cbmxldCBldmVudHMgPSBuZXcgRXZlbnRzKCk7XG5leHBvcnQgZGVmYXVsdCBldmVudHM7IiwiLyoqXG4gKiBUaGUgY29weXJpZ2h0IGluIHRoaXMgc29mdHdhcmUgaXMgYmVpbmcgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBMaWNlbnNlLFxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICogIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xuICogIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBBUyBJUyBBTkQgQU5ZXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cbiAqICBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULFxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXG4gKiAgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXG4gKiAgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cbi8qKlxuICogQGNsYXNzXG4gKiBAaWdub3JlXG4gKi9cbmNsYXNzIEV2ZW50c0Jhc2Uge1xuICAgIGV4dGVuZCAoZXZlbnRzLCBjb25maWcpIHtcbiAgICAgICAgaWYgKCFldmVudHMpIHJldHVybjtcblxuICAgICAgICBsZXQgb3ZlcnJpZGUgPSBjb25maWcgPyBjb25maWcub3ZlcnJpZGUgOiBmYWxzZTtcbiAgICAgICAgbGV0IHB1YmxpY09ubHkgPSBjb25maWcgPyBjb25maWcucHVibGljT25seSA6IGZhbHNlO1xuXG5cbiAgICAgICAgZm9yIChjb25zdCBldnQgaW4gZXZlbnRzKSB7XG4gICAgICAgICAgICBpZiAoIWV2ZW50cy5oYXNPd25Qcm9wZXJ0eShldnQpIHx8ICh0aGlzW2V2dF0gJiYgIW92ZXJyaWRlKSkgY29udGludWU7XG4gICAgICAgICAgICBpZiAocHVibGljT25seSAmJiBldmVudHNbZXZ0XS5pbmRleE9mKCdwdWJsaWNfJykgPT09IC0xKSBjb250aW51ZTtcbiAgICAgICAgICAgIHRoaXNbZXZ0XSA9IGV2ZW50c1tldnRdO1xuXG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEV2ZW50c0Jhc2U7IiwiLyoqXG4gKiBUaGUgY29weXJpZ2h0IGluIHRoaXMgc29mdHdhcmUgaXMgYmVpbmcgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBMaWNlbnNlLFxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICogIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xuICogIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBBUyBJUyBBTkQgQU5ZXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cbiAqICBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULFxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXG4gKiAgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXG4gKiAgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cblxuaW1wb3J0IEZhY3RvcnlNYWtlciBmcm9tICcuLi8uLi9jb3JlL0ZhY3RvcnlNYWtlci5qcyc7XG5cbmltcG9ydCB7Z2V0SW5kZXhCYXNlZFNlZ21lbnQsIGRlY2lkZVNlZ21lbnRMaXN0UmFuZ2VGb3JUZW1wbGF0ZX0gZnJvbSAnLi9TZWdtZW50c1V0aWxzLmpzJztcblxuZnVuY3Rpb24gTGlzdFNlZ21lbnRzR2V0dGVyKGNvbmZpZywgaXNEeW5hbWljKSB7XG5cbiAgICBsZXQgdGltZWxpbmVDb252ZXJ0ZXIgPSBjb25maWcudGltZWxpbmVDb252ZXJ0ZXI7XG5cbiAgICBsZXQgaW5zdGFuY2U7XG5cbiAgICBmdW5jdGlvbiBnZXRTZWdtZW50c0Zyb21MaXN0KHJlcHJlc2VudGF0aW9uLCByZXF1ZXN0ZWRUaW1lLCBpbmRleCwgYXZhaWxhYmlsaXR5VXBwZXJMaW1pdCkge1xuICAgICAgICB2YXIgbGlzdCA9IHJlcHJlc2VudGF0aW9uLmFkYXB0YXRpb24ucGVyaW9kLm1wZC5tYW5pZmVzdC5QZXJpb2RfYXNBcnJheVtyZXByZXNlbnRhdGlvbi5hZGFwdGF0aW9uLnBlcmlvZC5pbmRleF0uXG4gICAgICAgICAgICBBZGFwdGF0aW9uU2V0X2FzQXJyYXlbcmVwcmVzZW50YXRpb24uYWRhcHRhdGlvbi5pbmRleF0uUmVwcmVzZW50YXRpb25fYXNBcnJheVtyZXByZXNlbnRhdGlvbi5pbmRleF0uU2VnbWVudExpc3Q7XG4gICAgICAgIHZhciBiYXNlVVJMID0gcmVwcmVzZW50YXRpb24uYWRhcHRhdGlvbi5wZXJpb2QubXBkLm1hbmlmZXN0LlBlcmlvZF9hc0FycmF5W3JlcHJlc2VudGF0aW9uLmFkYXB0YXRpb24ucGVyaW9kLmluZGV4XS5cbiAgICAgICAgICAgIEFkYXB0YXRpb25TZXRfYXNBcnJheVtyZXByZXNlbnRhdGlvbi5hZGFwdGF0aW9uLmluZGV4XS5SZXByZXNlbnRhdGlvbl9hc0FycmF5W3JlcHJlc2VudGF0aW9uLmluZGV4XS5CYXNlVVJMO1xuICAgICAgICB2YXIgbGVuID0gbGlzdC5TZWdtZW50VVJMX2FzQXJyYXkubGVuZ3RoO1xuXG4gICAgICAgIHZhciBzZWdtZW50cyA9IFtdO1xuXG4gICAgICAgIHZhciBwZXJpb2RTZWdJZHgsXG4gICAgICAgICAgICBzZWcsXG4gICAgICAgICAgICBzLFxuICAgICAgICAgICAgcmFuZ2UsXG4gICAgICAgICAgICBzdGFydElkeCxcbiAgICAgICAgICAgIGVuZElkeCxcbiAgICAgICAgICAgIHN0YXJ0O1xuXG4gICAgICAgIHN0YXJ0ID0gcmVwcmVzZW50YXRpb24uc3RhcnROdW1iZXI7XG5cbiAgICAgICAgcmFuZ2UgPSBkZWNpZGVTZWdtZW50TGlzdFJhbmdlRm9yVGVtcGxhdGUodGltZWxpbmVDb252ZXJ0ZXIsIGlzRHluYW1pYywgcmVwcmVzZW50YXRpb24sIHJlcXVlc3RlZFRpbWUsIGluZGV4LCBhdmFpbGFiaWxpdHlVcHBlckxpbWl0KTtcbiAgICAgICAgc3RhcnRJZHggPSBNYXRoLm1heChyYW5nZS5zdGFydCwgMCk7XG4gICAgICAgIGVuZElkeCA9IE1hdGgubWluKHJhbmdlLmVuZCwgbGlzdC5TZWdtZW50VVJMX2FzQXJyYXkubGVuZ3RoIC0gMSk7XG5cbiAgICAgICAgZm9yIChwZXJpb2RTZWdJZHggPSBzdGFydElkeDsgcGVyaW9kU2VnSWR4IDw9IGVuZElkeDsgcGVyaW9kU2VnSWR4KyspIHtcbiAgICAgICAgICAgIHMgPSBsaXN0LlNlZ21lbnRVUkxfYXNBcnJheVtwZXJpb2RTZWdJZHhdO1xuXG4gICAgICAgICAgICBzZWcgPSBnZXRJbmRleEJhc2VkU2VnbWVudCh0aW1lbGluZUNvbnZlcnRlciwgaXNEeW5hbWljLCByZXByZXNlbnRhdGlvbiwgcGVyaW9kU2VnSWR4KTtcbiAgICAgICAgICAgIHNlZy5yZXBsYWNlbWVudFRpbWUgPSAoc3RhcnQgKyBwZXJpb2RTZWdJZHggLSAxKSAqIHJlcHJlc2VudGF0aW9uLnNlZ21lbnREdXJhdGlvbjtcbiAgICAgICAgICAgIHNlZy5tZWRpYSA9IHMubWVkaWEgPyBzLm1lZGlhIDogYmFzZVVSTDtcbiAgICAgICAgICAgIHNlZy5tZWRpYVJhbmdlID0gcy5tZWRpYVJhbmdlO1xuICAgICAgICAgICAgc2VnLmluZGV4ID0gcy5pbmRleDtcbiAgICAgICAgICAgIHNlZy5pbmRleFJhbmdlID0gcy5pbmRleFJhbmdlO1xuXG4gICAgICAgICAgICBzZWdtZW50cy5wdXNoKHNlZyk7XG4gICAgICAgICAgICBzZWcgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVwcmVzZW50YXRpb24uYXZhaWxhYmxlU2VnbWVudHNOdW1iZXIgPSBsZW47XG5cbiAgICAgICAgcmV0dXJuIHNlZ21lbnRzO1xuICAgIH1cblxuICAgIGluc3RhbmNlID0ge1xuICAgICAgICBnZXRTZWdtZW50czogZ2V0U2VnbWVudHNGcm9tTGlzdFxuICAgIH07XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbkxpc3RTZWdtZW50c0dldHRlci5fX2Rhc2hqc19mYWN0b3J5X25hbWUgPSAnTGlzdFNlZ21lbnRzR2V0dGVyJztcbmNvbnN0IGZhY3RvcnkgPSBGYWN0b3J5TWFrZXIuZ2V0Q2xhc3NGYWN0b3J5KExpc3RTZWdtZW50c0dldHRlcik7XG5leHBvcnQgZGVmYXVsdCBmYWN0b3J5O1xuIiwiLyoqXG4gKiBUaGUgY29weXJpZ2h0IGluIHRoaXMgc29mdHdhcmUgaXMgYmVpbmcgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBMaWNlbnNlLFxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICogIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xuICogIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBBUyBJUyBBTkQgQU5ZXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cbiAqICBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULFxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXG4gKiAgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXG4gKiAgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cblxuaW1wb3J0IEZhY3RvcnlNYWtlciBmcm9tICcuLi8uLi9jb3JlL0ZhY3RvcnlNYWtlci5qcyc7XG5pbXBvcnQgVGltZWxpbmVTZWdtZW50c0dldHRlciBmcm9tICcuL1RpbWVsaW5lU2VnbWVudHNHZXR0ZXIuanMnO1xuaW1wb3J0IFRlbXBsYXRlU2VnbWVudHNHZXR0ZXIgZnJvbSAnLi9UZW1wbGF0ZVNlZ21lbnRzR2V0dGVyLmpzJztcbmltcG9ydCBMaXN0U2VnbWVudHNHZXR0ZXIgZnJvbSAnLi9MaXN0U2VnbWVudHNHZXR0ZXIuanMnO1xuXG5mdW5jdGlvbiBTZWdtZW50c0dldHRlcihjb25maWcsIGlzRHluYW1pYykge1xuXG4gICAgbGV0IGNvbnRleHQgPSB0aGlzLmNvbnRleHQ7XG5cbiAgICBsZXQgaW5zdGFuY2UsXG4gICAgICAgIHRpbWVsaW5lU2VnbWVudHNHZXR0ZXIsXG4gICAgICAgIHRlbXBsYXRlU2VnbWVudHNHZXR0ZXIsXG4gICAgICAgIGxpc3RTZWdtZW50c0dldHRlcjtcblxuICAgIGZ1bmN0aW9uIHNldHVwKCkge1xuICAgICAgICB0aW1lbGluZVNlZ21lbnRzR2V0dGVyID0gVGltZWxpbmVTZWdtZW50c0dldHRlcihjb250ZXh0KS5jcmVhdGUoY29uZmlnLCBpc0R5bmFtaWMpO1xuICAgICAgICB0ZW1wbGF0ZVNlZ21lbnRzR2V0dGVyID0gVGVtcGxhdGVTZWdtZW50c0dldHRlcihjb250ZXh0KS5jcmVhdGUoY29uZmlnLCBpc0R5bmFtaWMpO1xuICAgICAgICBsaXN0U2VnbWVudHNHZXR0ZXIgPSBMaXN0U2VnbWVudHNHZXR0ZXIoY29udGV4dCkuY3JlYXRlKGNvbmZpZywgaXNEeW5hbWljKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTZWdtZW50cyhyZXByZXNlbnRhdGlvbiwgcmVxdWVzdGVkVGltZSwgaW5kZXgsIG9uU2VnbWVudExpc3RVcGRhdGVkQ2FsbGJhY2ssIGF2YWlsYWJpbGl0eVVwcGVyTGltaXQpIHtcbiAgICAgICAgdmFyIHNlZ21lbnRzO1xuICAgICAgICB2YXIgdHlwZSA9IHJlcHJlc2VudGF0aW9uLnNlZ21lbnRJbmZvVHlwZTtcblxuICAgICAgICAvLyBBbHJlYWR5IGZpZ3VyZSBvdXQgdGhlIHNlZ21lbnRzLlxuICAgICAgICBpZiAodHlwZSA9PT0gJ1NlZ21lbnRCYXNlJyB8fCB0eXBlID09PSAnQmFzZVVSTCcgfHwgIWlzU2VnbWVudExpc3RVcGRhdGVSZXF1aXJlZChyZXByZXNlbnRhdGlvbiwgaW5kZXgpKSB7XG4gICAgICAgICAgICBzZWdtZW50cyA9IHJlcHJlc2VudGF0aW9uLnNlZ21lbnRzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdTZWdtZW50VGltZWxpbmUnKSB7XG4gICAgICAgICAgICAgICAgc2VnbWVudHMgPSB0aW1lbGluZVNlZ21lbnRzR2V0dGVyLmdldFNlZ21lbnRzKHJlcHJlc2VudGF0aW9uLCByZXF1ZXN0ZWRUaW1lLCBpbmRleCwgYXZhaWxhYmlsaXR5VXBwZXJMaW1pdCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdTZWdtZW50VGVtcGxhdGUnKSB7XG4gICAgICAgICAgICAgICAgc2VnbWVudHMgPSB0ZW1wbGF0ZVNlZ21lbnRzR2V0dGVyLmdldFNlZ21lbnRzKHJlcHJlc2VudGF0aW9uLCByZXF1ZXN0ZWRUaW1lLCBpbmRleCwgYXZhaWxhYmlsaXR5VXBwZXJMaW1pdCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdTZWdtZW50TGlzdCcpIHtcbiAgICAgICAgICAgICAgICBzZWdtZW50cyA9IGxpc3RTZWdtZW50c0dldHRlci5nZXRTZWdtZW50cyhyZXByZXNlbnRhdGlvbiwgcmVxdWVzdGVkVGltZSwgaW5kZXgsIGF2YWlsYWJpbGl0eVVwcGVyTGltaXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob25TZWdtZW50TGlzdFVwZGF0ZWRDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIG9uU2VnbWVudExpc3RVcGRhdGVkQ2FsbGJhY2socmVwcmVzZW50YXRpb24sIHNlZ21lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZWdtZW50cztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc1NlZ21lbnRMaXN0VXBkYXRlUmVxdWlyZWQocmVwcmVzZW50YXRpb24sIGluZGV4KSB7XG4gICAgICAgIHZhciBzZWdtZW50cyA9IHJlcHJlc2VudGF0aW9uLnNlZ21lbnRzO1xuICAgICAgICB2YXIgdXBkYXRlUmVxdWlyZWQgPSBmYWxzZTtcblxuICAgICAgICB2YXIgdXBwZXJJZHgsXG4gICAgICAgICAgICBsb3dlcklkeDtcblxuICAgICAgICBpZiAoIXNlZ21lbnRzIHx8IHNlZ21lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdXBkYXRlUmVxdWlyZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG93ZXJJZHggPSBzZWdtZW50c1swXS5hdmFpbGFiaWxpdHlJZHg7XG4gICAgICAgICAgICB1cHBlcklkeCA9IHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtIDFdLmF2YWlsYWJpbGl0eUlkeDtcbiAgICAgICAgICAgIHVwZGF0ZVJlcXVpcmVkID0gKGluZGV4IDwgbG93ZXJJZHgpIHx8IChpbmRleCA+IHVwcGVySWR4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB1cGRhdGVSZXF1aXJlZDtcbiAgICB9XG5cbiAgICBpbnN0YW5jZSA9IHtcbiAgICAgICAgZ2V0U2VnbWVudHM6IGdldFNlZ21lbnRzXG4gICAgfTtcblxuICAgIHNldHVwKCk7XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG59XG5cblNlZ21lbnRzR2V0dGVyLl9fZGFzaGpzX2ZhY3RvcnlfbmFtZSA9ICdTZWdtZW50c0dldHRlcic7XG5jb25zdCBmYWN0b3J5ID0gRmFjdG9yeU1ha2VyLmdldENsYXNzRmFjdG9yeShTZWdtZW50c0dldHRlcik7XG5leHBvcnQgZGVmYXVsdCBmYWN0b3J5O1xuIiwiLyoqXG4gKiBUaGUgY29weXJpZ2h0IGluIHRoaXMgc29mdHdhcmUgaXMgYmVpbmcgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBMaWNlbnNlLFxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICogIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xuICogIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBBUyBJUyBBTkQgQU5ZXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cbiAqICBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULFxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXG4gKiAgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXG4gKiAgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cblxuaW1wb3J0IFNlZ21lbnQgZnJvbSAnLi8uLi92by9TZWdtZW50LmpzJztcblxuZnVuY3Rpb24gemVyb1BhZFRvTGVuZ3RoKG51bVN0ciwgbWluU3RyTGVuZ3RoKSB7XG4gICAgd2hpbGUgKG51bVN0ci5sZW5ndGggPCBtaW5TdHJMZW5ndGgpIHtcbiAgICAgICAgbnVtU3RyID0gJzAnICsgbnVtU3RyO1xuICAgIH1cbiAgICByZXR1cm4gbnVtU3RyO1xufVxuXG5mdW5jdGlvbiBnZXROdW1iZXJGb3JTZWdtZW50KHNlZ21lbnQsIHNlZ21lbnRJbmRleCkge1xuICAgIHJldHVybiBzZWdtZW50LnJlcHJlc2VudGF0aW9uLnN0YXJ0TnVtYmVyICsgc2VnbWVudEluZGV4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVwbGFjZVRva2VuRm9yVGVtcGxhdGUodXJsLCB0b2tlbiwgdmFsdWUpIHtcbiAgICB2YXIgZm9ybWF0VGFnID0gJyUwJztcblxuICAgIHZhciBzdGFydFBvcyxcbiAgICAgICAgZW5kUG9zLFxuICAgICAgICBmb3JtYXRUYWdQb3MsXG4gICAgICAgIHNwZWNpZmllcixcbiAgICAgICAgd2lkdGgsXG4gICAgICAgIHBhZGRlZFZhbHVlO1xuXG4gICAgdmFyIHRva2VuTGVuID0gdG9rZW4ubGVuZ3RoO1xuICAgIHZhciBmb3JtYXRUYWdMZW4gPSBmb3JtYXRUYWcubGVuZ3RoO1xuXG4gICAgLy8ga2VlcCBsb29waW5nIHJvdW5kIHVudGlsIGFsbCBpbnN0YW5jZXMgb2YgPHRva2VuPiBoYXZlIGJlZW5cbiAgICAvLyByZXBsYWNlZC4gb25jZSB0aGF0IGhhcyBoYXBwZW5lZCwgc3RhcnRQb3MgYmVsb3cgd2lsbCBiZSAtMVxuICAgIC8vIGFuZCB0aGUgY29tcGxldGVkIHVybCB3aWxsIGJlIHJldHVybmVkLlxuICAgIHdoaWxlICh0cnVlKSB7XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgaXMgYSB2YWxpZCAkPHRva2VuPi4uLiQgaWRlbnRpZmllclxuICAgICAgICAvLyBpZiBub3QsIHJldHVybiB0aGUgdXJsIGFzIGlzLlxuICAgICAgICBzdGFydFBvcyA9IHVybC5pbmRleE9mKCckJyArIHRva2VuKTtcbiAgICAgICAgaWYgKHN0YXJ0UG9zIDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRoZSBuZXh0ICckJyBtdXN0IGJlIHRoZSBlbmQgb2YgdGhlIGlkZW50aWZpZXJcbiAgICAgICAgLy8gaWYgdGhlcmUgaXNuJ3Qgb25lLCByZXR1cm4gdGhlIHVybCBhcyBpcy5cbiAgICAgICAgZW5kUG9zID0gdXJsLmluZGV4T2YoJyQnLCBzdGFydFBvcyArIHRva2VuTGVuKTtcbiAgICAgICAgaWYgKGVuZFBvcyA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiB1cmw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBub3cgc2VlIGlmIHRoZXJlIGlzIGFuIGFkZGl0aW9uYWwgZm9ybWF0IHRhZyBzdWZmaXhlZCB0b1xuICAgICAgICAvLyB0aGUgaWRlbnRpZmllciB3aXRoaW4gdGhlIGVuY2xvc2luZyAnJCcgY2hhcmFjdGVyc1xuICAgICAgICBmb3JtYXRUYWdQb3MgPSB1cmwuaW5kZXhPZihmb3JtYXRUYWcsIHN0YXJ0UG9zICsgdG9rZW5MZW4pO1xuICAgICAgICBpZiAoZm9ybWF0VGFnUG9zID4gc3RhcnRQb3MgJiYgZm9ybWF0VGFnUG9zIDwgZW5kUG9zKSB7XG5cbiAgICAgICAgICAgIHNwZWNpZmllciA9IHVybC5jaGFyQXQoZW5kUG9zIC0gMSk7XG4gICAgICAgICAgICB3aWR0aCA9IHBhcnNlSW50KHVybC5zdWJzdHJpbmcoZm9ybWF0VGFnUG9zICsgZm9ybWF0VGFnTGVuLCBlbmRQb3MgLSAxKSwgMTApO1xuXG4gICAgICAgICAgICAvLyBzdXBwb3J0IHRoZSBtaW5pbXVtIHNwZWNpZmllcnMgcmVxdWlyZWQgYnkgSUVFRSAxMDAzLjFcbiAgICAgICAgICAgIC8vIChkLCBpICwgbywgdSwgeCwgYW5kIFgpIGZvciBjb21wbGV0ZW5lc3NcbiAgICAgICAgICAgIHN3aXRjaCAoc3BlY2lmaWVyKSB7XG4gICAgICAgICAgICAgICAgLy8gdHJlYXQgYWxsIGludCB0eXBlcyBhcyB1aW50LFxuICAgICAgICAgICAgICAgIC8vIGhlbmNlIGRlbGliZXJhdGUgZmFsbHRocm91Z2hcbiAgICAgICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICBjYXNlICdpJzpcbiAgICAgICAgICAgICAgICBjYXNlICd1JzpcbiAgICAgICAgICAgICAgICAgICAgcGFkZGVkVmFsdWUgPSB6ZXJvUGFkVG9MZW5ndGgodmFsdWUudG9TdHJpbmcoKSwgd2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICd4JzpcbiAgICAgICAgICAgICAgICAgICAgcGFkZGVkVmFsdWUgPSB6ZXJvUGFkVG9MZW5ndGgodmFsdWUudG9TdHJpbmcoMTYpLCB3aWR0aCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ1gnOlxuICAgICAgICAgICAgICAgICAgICBwYWRkZWRWYWx1ZSA9IHplcm9QYWRUb0xlbmd0aCh2YWx1ZS50b1N0cmluZygxNiksIHdpZHRoKS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdvJzpcbiAgICAgICAgICAgICAgICAgICAgcGFkZGVkVmFsdWUgPSB6ZXJvUGFkVG9MZW5ndGgodmFsdWUudG9TdHJpbmcoOCksIHdpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgLy9UT0RPOiBjb21tZW50ZWQgb3V0IGxvZ2dpbmcgdG8gc3VwcmVzcyBqc2hpbnQgd2FybmluZyAtLSBgbG9nYCBpcyB1bmRlZmluZWQgaGVyZVxuICAgICAgICAgICAgICAgICAgICAvL2xvZygnVW5zdXBwb3J0ZWQvaW52YWxpZCBJRUVFIDEwMDMuMSBmb3JtYXQgaWRlbnRpZmllciBzdHJpbmcgaW4gVVJMJyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1cmw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYWRkZWRWYWx1ZSA9IHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsID0gdXJsLnN1YnN0cmluZygwLCBzdGFydFBvcykgKyBwYWRkZWRWYWx1ZSArIHVybC5zdWJzdHJpbmcoZW5kUG9zICsgMSk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5kZXhCYXNlZFNlZ21lbnQodGltZWxpbmVDb252ZXJ0ZXIsIGlzRHluYW1pYywgcmVwcmVzZW50YXRpb24sIGluZGV4KSB7XG4gICAgdmFyIHNlZyxcbiAgICAgICAgZHVyYXRpb24sXG4gICAgICAgIHByZXNlbnRhdGlvblN0YXJ0VGltZSxcbiAgICAgICAgcHJlc2VudGF0aW9uRW5kVGltZTtcblxuICAgIGR1cmF0aW9uID0gcmVwcmVzZW50YXRpb24uc2VnbWVudER1cmF0aW9uO1xuXG4gICAgLypcbiAgICAgKiBGcm9tIHNwZWMgLSBJZiBuZWl0aGVyIEBkdXJhdGlvbiBhdHRyaWJ1dGUgbm9yIFNlZ21lbnRUaW1lbGluZSBlbGVtZW50IGlzIHByZXNlbnQsIHRoZW4gdGhlIFJlcHJlc2VudGF0aW9uXG4gICAgICogc2hhbGwgY29udGFpbiBleGFjdGx5IG9uZSBNZWRpYSBTZWdtZW50LiBUaGUgTVBEIHN0YXJ0IHRpbWUgaXMgMCBhbmQgdGhlIE1QRCBkdXJhdGlvbiBpcyBvYnRhaW5lZFxuICAgICAqIGluIHRoZSBzYW1lIHdheSBhcyBmb3IgdGhlIGxhc3QgTWVkaWEgU2VnbWVudCBpbiB0aGUgUmVwcmVzZW50YXRpb24uXG4gICAgICovXG4gICAgaWYgKGlzTmFOKGR1cmF0aW9uKSkge1xuICAgICAgICBkdXJhdGlvbiA9IHJlcHJlc2VudGF0aW9uLmFkYXB0YXRpb24ucGVyaW9kLmR1cmF0aW9uO1xuICAgIH1cblxuICAgIHByZXNlbnRhdGlvblN0YXJ0VGltZSA9IHJlcHJlc2VudGF0aW9uLmFkYXB0YXRpb24ucGVyaW9kLnN0YXJ0ICsgKGluZGV4ICogZHVyYXRpb24pO1xuICAgIHByZXNlbnRhdGlvbkVuZFRpbWUgPSBwcmVzZW50YXRpb25TdGFydFRpbWUgKyBkdXJhdGlvbjtcblxuICAgIHNlZyA9IG5ldyBTZWdtZW50KCk7XG5cbiAgICBzZWcucmVwcmVzZW50YXRpb24gPSByZXByZXNlbnRhdGlvbjtcbiAgICBzZWcuZHVyYXRpb24gPSBkdXJhdGlvbjtcbiAgICBzZWcucHJlc2VudGF0aW9uU3RhcnRUaW1lID0gcHJlc2VudGF0aW9uU3RhcnRUaW1lO1xuXG4gICAgc2VnLm1lZGlhU3RhcnRUaW1lID0gdGltZWxpbmVDb252ZXJ0ZXIuY2FsY01lZGlhVGltZUZyb21QcmVzZW50YXRpb25UaW1lKHNlZy5wcmVzZW50YXRpb25TdGFydFRpbWUsIHJlcHJlc2VudGF0aW9uKTtcblxuICAgIHNlZy5hdmFpbGFiaWxpdHlTdGFydFRpbWUgPSB0aW1lbGluZUNvbnZlcnRlci5jYWxjQXZhaWxhYmlsaXR5U3RhcnRUaW1lRnJvbVByZXNlbnRhdGlvblRpbWUoc2VnLnByZXNlbnRhdGlvblN0YXJ0VGltZSwgcmVwcmVzZW50YXRpb24uYWRhcHRhdGlvbi5wZXJpb2QubXBkLCBpc0R5bmFtaWMpO1xuICAgIHNlZy5hdmFpbGFiaWxpdHlFbmRUaW1lID0gdGltZWxpbmVDb252ZXJ0ZXIuY2FsY0F2YWlsYWJpbGl0eUVuZFRpbWVGcm9tUHJlc2VudGF0aW9uVGltZShwcmVzZW50YXRpb25FbmRUaW1lLCByZXByZXNlbnRhdGlvbi5hZGFwdGF0aW9uLnBlcmlvZC5tcGQsIGlzRHluYW1pYyk7XG5cbiAgICAvLyBhdCB0aGlzIHdhbGwgY2xvY2sgdGltZSwgdGhlIHZpZGVvIGVsZW1lbnQgY3VycmVudFRpbWUgc2hvdWxkIGJlIHNlZy5wcmVzZW50YXRpb25TdGFydFRpbWVcbiAgICBzZWcud2FsbFN0YXJ0VGltZSA9IHRpbWVsaW5lQ29udmVydGVyLmNhbGNXYWxsVGltZUZvclNlZ21lbnQoc2VnLCBpc0R5bmFtaWMpO1xuXG4gICAgc2VnLnJlcGxhY2VtZW50TnVtYmVyID0gZ2V0TnVtYmVyRm9yU2VnbWVudChzZWcsIGluZGV4KTtcbiAgICBzZWcuYXZhaWxhYmlsaXR5SWR4ID0gaW5kZXg7XG5cbiAgICByZXR1cm4gc2VnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGltZUJhc2VkU2VnbWVudCh0aW1lbGluZUNvbnZlcnRlciwgaXNEeW5hbWljLCByZXByZXNlbnRhdGlvbiwgdGltZSwgZHVyYXRpb24sIGZUaW1lc2NhbGUsIHVybCwgcmFuZ2UsIGluZGV4KSB7XG4gICAgdmFyIHNjYWxlZFRpbWUgPSB0aW1lIC8gZlRpbWVzY2FsZTtcbiAgICB2YXIgc2NhbGVkRHVyYXRpb24gPSBNYXRoLm1pbihkdXJhdGlvbiAvIGZUaW1lc2NhbGUsIHJlcHJlc2VudGF0aW9uLmFkYXB0YXRpb24ucGVyaW9kLm1wZC5tYXhTZWdtZW50RHVyYXRpb24pO1xuXG4gICAgdmFyIHByZXNlbnRhdGlvblN0YXJ0VGltZSxcbiAgICAgICAgcHJlc2VudGF0aW9uRW5kVGltZSxcbiAgICAgICAgc2VnO1xuXG4gICAgcHJlc2VudGF0aW9uU3RhcnRUaW1lID0gdGltZWxpbmVDb252ZXJ0ZXIuY2FsY1ByZXNlbnRhdGlvblRpbWVGcm9tTWVkaWFUaW1lKHNjYWxlZFRpbWUsIHJlcHJlc2VudGF0aW9uKTtcbiAgICBwcmVzZW50YXRpb25FbmRUaW1lID0gcHJlc2VudGF0aW9uU3RhcnRUaW1lICsgc2NhbGVkRHVyYXRpb247XG5cbiAgICBzZWcgPSBuZXcgU2VnbWVudCgpO1xuXG4gICAgc2VnLnJlcHJlc2VudGF0aW9uID0gcmVwcmVzZW50YXRpb247XG4gICAgc2VnLmR1cmF0aW9uID0gc2NhbGVkRHVyYXRpb247XG4gICAgc2VnLm1lZGlhU3RhcnRUaW1lID0gc2NhbGVkVGltZTtcblxuICAgIHNlZy5wcmVzZW50YXRpb25TdGFydFRpbWUgPSBwcmVzZW50YXRpb25TdGFydFRpbWU7XG5cbiAgICAvLyBGb3IgU2VnbWVudFRpbWVsaW5lIGV2ZXJ5IHNlZ21lbnQgaXMgYXZhaWxhYmxlIGF0IGxvYWRlZFRpbWVcbiAgICBzZWcuYXZhaWxhYmlsaXR5U3RhcnRUaW1lID0gcmVwcmVzZW50YXRpb24uYWRhcHRhdGlvbi5wZXJpb2QubXBkLm1hbmlmZXN0LmxvYWRlZFRpbWU7XG4gICAgc2VnLmF2YWlsYWJpbGl0eUVuZFRpbWUgPSB0aW1lbGluZUNvbnZlcnRlci5jYWxjQXZhaWxhYmlsaXR5RW5kVGltZUZyb21QcmVzZW50YXRpb25UaW1lKHByZXNlbnRhdGlvbkVuZFRpbWUsIHJlcHJlc2VudGF0aW9uLmFkYXB0YXRpb24ucGVyaW9kLm1wZCwgaXNEeW5hbWljKTtcblxuICAgIC8vIGF0IHRoaXMgd2FsbCBjbG9jayB0aW1lLCB0aGUgdmlkZW8gZWxlbWVudCBjdXJyZW50VGltZSBzaG91bGQgYmUgc2VnLnByZXNlbnRhdGlvblN0YXJ0VGltZVxuICAgIHNlZy53YWxsU3RhcnRUaW1lID0gdGltZWxpbmVDb252ZXJ0ZXIuY2FsY1dhbGxUaW1lRm9yU2VnbWVudChzZWcsIGlzRHluYW1pYyk7XG5cbiAgICBzZWcucmVwbGFjZW1lbnRUaW1lID0gdGltZTtcblxuICAgIHNlZy5yZXBsYWNlbWVudE51bWJlciA9IGdldE51bWJlckZvclNlZ21lbnQoc2VnLCBpbmRleCk7XG5cbiAgICB1cmwgPSByZXBsYWNlVG9rZW5Gb3JUZW1wbGF0ZSh1cmwsICdOdW1iZXInLCBzZWcucmVwbGFjZW1lbnROdW1iZXIpO1xuICAgIHVybCA9IHJlcGxhY2VUb2tlbkZvclRlbXBsYXRlKHVybCwgJ1RpbWUnLCBzZWcucmVwbGFjZW1lbnRUaW1lKTtcbiAgICBzZWcubWVkaWEgPSB1cmw7XG4gICAgc2VnLm1lZGlhUmFuZ2UgPSByYW5nZTtcbiAgICBzZWcuYXZhaWxhYmlsaXR5SWR4ID0gaW5kZXg7XG5cbiAgICByZXR1cm4gc2VnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VnbWVudEJ5SW5kZXgoaW5kZXgsIHJlcHJlc2VudGF0aW9uKSB7XG4gICAgaWYgKCFyZXByZXNlbnRhdGlvbiB8fCAhcmVwcmVzZW50YXRpb24uc2VnbWVudHMpIHJldHVybiBudWxsO1xuXG4gICAgdmFyIGxuID0gcmVwcmVzZW50YXRpb24uc2VnbWVudHMubGVuZ3RoO1xuICAgIHZhciBzZWcsXG4gICAgICAgIGk7XG5cbiAgICBpZiAoaW5kZXggPCBsbikge1xuICAgICAgICBzZWcgPSByZXByZXNlbnRhdGlvbi5zZWdtZW50c1tpbmRleF07XG4gICAgICAgIGlmIChzZWcgJiYgc2VnLmF2YWlsYWJpbGl0eUlkeCA9PT0gaW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiBzZWc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbG47IGkrKykge1xuICAgICAgICBzZWcgPSByZXByZXNlbnRhdGlvbi5zZWdtZW50c1tpXTtcblxuICAgICAgICBpZiAoc2VnICYmIHNlZy5hdmFpbGFiaWxpdHlJZHggPT09IGluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gc2VnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGRlY2lkZVNlZ21lbnRMaXN0UmFuZ2VGb3JUaW1lbGluZSh0aW1lbGluZUNvbnZlcnRlciwgaXNEeW5hbWljLCByZXF1ZXN0ZWRUaW1lLCBpbmRleCwgZ2l2ZW5BdmFpbGFiaWxpdHlVcHBlckxpbWl0KSB7XG4gICAgdmFyIGF2YWlsYWJpbGl0eUxvd2VyTGltaXQgPSAyO1xuICAgIHZhciBhdmFpbGFiaWxpdHlVcHBlckxpbWl0ID0gZ2l2ZW5BdmFpbGFiaWxpdHlVcHBlckxpbWl0IHx8IDEwO1xuICAgIHZhciBmaXJzdElkeCA9IDA7XG4gICAgdmFyIGxhc3RJZHggPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG5cbiAgICB2YXIgc3RhcnQsXG4gICAgICAgIGVuZCxcbiAgICAgICAgcmFuZ2U7XG5cbiAgICBpZiAoaXNEeW5hbWljICYmICF0aW1lbGluZUNvbnZlcnRlci5pc1RpbWVTeW5jQ29tcGxldGVkKCkpIHtcbiAgICAgICAgcmFuZ2UgPSB7c3RhcnQ6IGZpcnN0SWR4LCBlbmQ6IGxhc3RJZHh9O1xuICAgICAgICByZXR1cm4gcmFuZ2U7XG4gICAgfVxuXG4gICAgaWYgKCghaXNEeW5hbWljICYmIHJlcXVlc3RlZFRpbWUpIHx8IGluZGV4IDwgMCkgcmV0dXJuIG51bGw7XG5cbiAgICAvLyBzZWdtZW50IGxpc3Qgc2hvdWxkIG5vdCBiZSBvdXQgb2YgdGhlIGF2YWlsYWJpbGl0eSB3aW5kb3cgcmFuZ2VcbiAgICBzdGFydCA9IE1hdGgubWF4KGluZGV4IC0gYXZhaWxhYmlsaXR5TG93ZXJMaW1pdCwgZmlyc3RJZHgpO1xuICAgIGVuZCA9IE1hdGgubWluKGluZGV4ICsgYXZhaWxhYmlsaXR5VXBwZXJMaW1pdCwgbGFzdElkeCk7XG5cbiAgICByYW5nZSA9IHtzdGFydDogc3RhcnQsIGVuZDogZW5kfTtcblxuICAgIHJldHVybiByYW5nZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlY2lkZVNlZ21lbnRMaXN0UmFuZ2VGb3JUZW1wbGF0ZSh0aW1lbGluZUNvbnZlcnRlciwgaXNEeW5hbWljLCByZXByZXNlbnRhdGlvbiwgcmVxdWVzdGVkVGltZSwgaW5kZXgsIGdpdmVuQXZhaWxhYmlsaXR5VXBwZXJMaW1pdCkge1xuICAgIHZhciBkdXJhdGlvbiA9IHJlcHJlc2VudGF0aW9uLnNlZ21lbnREdXJhdGlvbjtcbiAgICB2YXIgbWluQnVmZmVyVGltZSA9IHJlcHJlc2VudGF0aW9uLmFkYXB0YXRpb24ucGVyaW9kLm1wZC5tYW5pZmVzdC5taW5CdWZmZXJUaW1lO1xuICAgIHZhciBhdmFpbGFiaWxpdHlXaW5kb3cgPSByZXByZXNlbnRhdGlvbi5zZWdtZW50QXZhaWxhYmlsaXR5UmFuZ2U7XG4gICAgdmFyIHBlcmlvZFJlbGF0aXZlUmFuZ2UgPSB7XG4gICAgICAgIHN0YXJ0OiB0aW1lbGluZUNvbnZlcnRlci5jYWxjUGVyaW9kUmVsYXRpdmVUaW1lRnJvbU1wZFJlbGF0aXZlVGltZShyZXByZXNlbnRhdGlvbiwgYXZhaWxhYmlsaXR5V2luZG93LnN0YXJ0KSxcbiAgICAgICAgZW5kOiB0aW1lbGluZUNvbnZlcnRlci5jYWxjUGVyaW9kUmVsYXRpdmVUaW1lRnJvbU1wZFJlbGF0aXZlVGltZShyZXByZXNlbnRhdGlvbiwgYXZhaWxhYmlsaXR5V2luZG93LmVuZClcbiAgICB9O1xuICAgIHZhciBjdXJyZW50U2VnbWVudExpc3QgPSByZXByZXNlbnRhdGlvbi5zZWdtZW50cztcbiAgICB2YXIgYXZhaWxhYmlsaXR5TG93ZXJMaW1pdCA9IDIgKiBkdXJhdGlvbjtcbiAgICB2YXIgYXZhaWxhYmlsaXR5VXBwZXJMaW1pdCA9IGdpdmVuQXZhaWxhYmlsaXR5VXBwZXJMaW1pdCB8fCBNYXRoLm1heCgyICogbWluQnVmZmVyVGltZSwgMTAgKiBkdXJhdGlvbik7XG5cbiAgICB2YXIgb3JpZ2luQXZhaWxhYmlsaXR5VGltZSA9IE5hTjtcbiAgICB2YXIgb3JpZ2luU2VnbWVudCA9IG51bGw7XG5cbiAgICB2YXIgc3RhcnQsXG4gICAgICAgIGVuZCxcbiAgICAgICAgcmFuZ2U7XG5cbiAgICBwZXJpb2RSZWxhdGl2ZVJhbmdlLnN0YXJ0ID0gTWF0aC5tYXgocGVyaW9kUmVsYXRpdmVSYW5nZS5zdGFydCwgMCk7XG5cbiAgICBpZiAoaXNEeW5hbWljICYmICF0aW1lbGluZUNvbnZlcnRlci5pc1RpbWVTeW5jQ29tcGxldGVkKCkpIHtcbiAgICAgICAgc3RhcnQgPSBNYXRoLmZsb29yKHBlcmlvZFJlbGF0aXZlUmFuZ2Uuc3RhcnQgLyBkdXJhdGlvbik7XG4gICAgICAgIGVuZCA9IE1hdGguZmxvb3IocGVyaW9kUmVsYXRpdmVSYW5nZS5lbmQgLyBkdXJhdGlvbik7XG4gICAgICAgIHJhbmdlID0ge3N0YXJ0OiBzdGFydCwgZW5kOiBlbmR9O1xuICAgICAgICByZXR1cm4gcmFuZ2U7XG4gICAgfVxuXG4gICAgLy8gaWYgc2VnbWVudHMgZXhpc3Qgd2Ugc2hvdWxkIHRyeSB0byBmaW5kIHRoZSBsYXRlc3QgYnVmZmVyZWQgdGltZSwgd2hpY2ggaXMgdGhlIHByZXNlbnRhdGlvbiB0aW1lIG9mIHRoZVxuICAgIC8vIHNlZ21lbnQgZm9yIHRoZSBjdXJyZW50IGluZGV4XG4gICAgaWYgKGN1cnJlbnRTZWdtZW50TGlzdCAmJiBjdXJyZW50U2VnbWVudExpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICBvcmlnaW5TZWdtZW50ID0gZ2V0U2VnbWVudEJ5SW5kZXgoaW5kZXgsIHJlcHJlc2VudGF0aW9uKTtcbiAgICAgICAgaWYgKG9yaWdpblNlZ21lbnQpIHtcbiAgICAgICAgICAgIG9yaWdpbkF2YWlsYWJpbGl0eVRpbWUgPSB0aW1lbGluZUNvbnZlcnRlci5jYWxjUGVyaW9kUmVsYXRpdmVUaW1lRnJvbU1wZFJlbGF0aXZlVGltZShyZXByZXNlbnRhdGlvbiwgb3JpZ2luU2VnbWVudC5wcmVzZW50YXRpb25TdGFydFRpbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3JpZ2luQXZhaWxhYmlsaXR5VGltZSA9IGluZGV4ID4gMCA/IGluZGV4ICogZHVyYXRpb24gOlxuICAgICAgICAgICAgICAgIHRpbWVsaW5lQ29udmVydGVyLmNhbGNQZXJpb2RSZWxhdGl2ZVRpbWVGcm9tTXBkUmVsYXRpdmVUaW1lKHJlcHJlc2VudGF0aW9uLCByZXF1ZXN0ZWRUaW1lKTtcbiAgICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSWYgbm8gc2VnbWVudHMgZXhpc3QsIGJ1dCBpbmRleCA+IDAsIGl0IG1lYW5zIHRoYXQgd2Ugc3dpdGNoIHRvIHRoZSBvdGhlciByZXByZXNlbnRhdGlvbiwgc29cbiAgICAgICAgLy8gd2Ugc2hvdWxkIHByb2NlZWQgZnJvbSB0aGlzIHRpbWUuXG4gICAgICAgIC8vIE90aGVyd2lzZSB3ZSBzaG91bGQgc3RhcnQgZnJvbSB0aGUgYmVnaW5uaW5nIGZvciBzdGF0aWMgbXBkcyBvciBmcm9tIHRoZSBlbmQgKGxpdmUgZWRnZSkgZm9yIGR5bmFtaWMgbXBkc1xuICAgICAgICBvcmlnaW5BdmFpbGFiaWxpdHlUaW1lID0gaW5kZXggPiAwID8gaW5kZXggKiBkdXJhdGlvbiA6IGlzRHluYW1pYyA/IHBlcmlvZFJlbGF0aXZlUmFuZ2UuZW5kIDogcGVyaW9kUmVsYXRpdmVSYW5nZS5zdGFydDtcbiAgICB9XG5cbiAgICAvLyBzZWdtZW50IGxpc3Qgc2hvdWxkIG5vdCBiZSBvdXQgb2YgdGhlIGF2YWlsYWJpbGl0eSB3aW5kb3cgcmFuZ2VcbiAgICBzdGFydCA9IE1hdGguZmxvb3IoTWF0aC5tYXgob3JpZ2luQXZhaWxhYmlsaXR5VGltZSAtIGF2YWlsYWJpbGl0eUxvd2VyTGltaXQsIHBlcmlvZFJlbGF0aXZlUmFuZ2Uuc3RhcnQpIC8gZHVyYXRpb24pO1xuICAgIGVuZCA9IE1hdGguZmxvb3IoTWF0aC5taW4oc3RhcnQgKyBhdmFpbGFiaWxpdHlVcHBlckxpbWl0IC8gZHVyYXRpb24sIHBlcmlvZFJlbGF0aXZlUmFuZ2UuZW5kIC8gZHVyYXRpb24pKTtcblxuICAgIHJhbmdlID0ge3N0YXJ0OiBzdGFydCwgZW5kOiBlbmR9O1xuXG4gICAgcmV0dXJuIHJhbmdlO1xufVxuXG5cbiIsIi8qKlxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxuICogcmlnaHRzLCBpbmNsdWRpbmcgcGF0ZW50IHJpZ2h0cywgYW5kIG5vIHN1Y2ggcmlnaHRzIGFyZSBncmFudGVkIHVuZGVyIHRoaXMgbGljZW5zZS5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG4gKiBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKiAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIERhc2ggSW5kdXN0cnkgRm9ydW0gbm9yIHRoZSBuYW1lcyBvZiBpdHNcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbiAqICBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXG4gKiAgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUlxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcbiAqICBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRVxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbmltcG9ydCBGYWN0b3J5TWFrZXIgZnJvbSAnLi4vLi4vY29yZS9GYWN0b3J5TWFrZXIuanMnO1xuXG5pbXBvcnQge3JlcGxhY2VUb2tlbkZvclRlbXBsYXRlLCBnZXRJbmRleEJhc2VkU2VnbWVudCwgZGVjaWRlU2VnbWVudExpc3RSYW5nZUZvclRlbXBsYXRlfSBmcm9tICcuL1NlZ21lbnRzVXRpbHMuanMnO1xuXG5mdW5jdGlvbiBUZW1wbGF0ZVNlZ21lbnRzR2V0dGVyKGNvbmZpZywgaXNEeW5hbWljKSB7XG5cbiAgICBsZXQgdGltZWxpbmVDb252ZXJ0ZXIgPSBjb25maWcudGltZWxpbmVDb252ZXJ0ZXI7XG5cbiAgICBsZXQgaW5zdGFuY2U7XG5cbiAgICBmdW5jdGlvbiBnZXRTZWdtZW50c0Zyb21UZW1wbGF0ZShyZXByZXNlbnRhdGlvbiwgcmVxdWVzdGVkVGltZSwgaW5kZXgsIGF2YWlsYWJpbGl0eVVwcGVyTGltaXQpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gcmVwcmVzZW50YXRpb24uYWRhcHRhdGlvbi5wZXJpb2QubXBkLm1hbmlmZXN0LlBlcmlvZF9hc0FycmF5W3JlcHJlc2VudGF0aW9uLmFkYXB0YXRpb24ucGVyaW9kLmluZGV4XS5cbiAgICAgICAgICAgIEFkYXB0YXRpb25TZXRfYXNBcnJheVtyZXByZXNlbnRhdGlvbi5hZGFwdGF0aW9uLmluZGV4XS5SZXByZXNlbnRhdGlvbl9hc0FycmF5W3JlcHJlc2VudGF0aW9uLmluZGV4XS5TZWdtZW50VGVtcGxhdGU7XG4gICAgICAgIHZhciBkdXJhdGlvbiA9IHJlcHJlc2VudGF0aW9uLnNlZ21lbnREdXJhdGlvbjtcbiAgICAgICAgdmFyIGF2YWlsYWJpbGl0eVdpbmRvdyA9IHJlcHJlc2VudGF0aW9uLnNlZ21lbnRBdmFpbGFiaWxpdHlSYW5nZTtcblxuICAgICAgICB2YXIgc2VnbWVudHMgPSBbXTtcbiAgICAgICAgdmFyIHVybCA9IG51bGw7XG4gICAgICAgIHZhciBzZWcgPSBudWxsO1xuXG4gICAgICAgIHZhciBzZWdtZW50UmFuZ2UsXG4gICAgICAgICAgICBwZXJpb2RTZWdJZHgsXG4gICAgICAgICAgICBzdGFydElkeCxcbiAgICAgICAgICAgIGVuZElkeCxcbiAgICAgICAgICAgIHN0YXJ0O1xuXG4gICAgICAgIHN0YXJ0ID0gcmVwcmVzZW50YXRpb24uc3RhcnROdW1iZXI7XG5cbiAgICAgICAgaWYgKGlzTmFOKGR1cmF0aW9uKSAmJiAhaXNEeW5hbWljKSB7XG4gICAgICAgICAgICBzZWdtZW50UmFuZ2UgPSB7c3RhcnQ6IHN0YXJ0LCBlbmQ6IHN0YXJ0fTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHNlZ21lbnRSYW5nZSA9IGRlY2lkZVNlZ21lbnRMaXN0UmFuZ2VGb3JUZW1wbGF0ZSh0aW1lbGluZUNvbnZlcnRlciwgaXNEeW5hbWljLCByZXByZXNlbnRhdGlvbiwgcmVxdWVzdGVkVGltZSwgaW5kZXgsIGF2YWlsYWJpbGl0eVVwcGVyTGltaXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhcnRJZHggPSBzZWdtZW50UmFuZ2Uuc3RhcnQ7XG4gICAgICAgIGVuZElkeCA9IHNlZ21lbnRSYW5nZS5lbmQ7XG5cbiAgICAgICAgZm9yIChwZXJpb2RTZWdJZHggPSBzdGFydElkeDsgcGVyaW9kU2VnSWR4IDw9IGVuZElkeDsgcGVyaW9kU2VnSWR4KyspIHtcblxuICAgICAgICAgICAgc2VnID0gZ2V0SW5kZXhCYXNlZFNlZ21lbnQodGltZWxpbmVDb252ZXJ0ZXIsIGlzRHluYW1pYywgcmVwcmVzZW50YXRpb24sIHBlcmlvZFNlZ0lkeCk7XG4gICAgICAgICAgICBzZWcucmVwbGFjZW1lbnRUaW1lID0gKHN0YXJ0ICsgcGVyaW9kU2VnSWR4IC0gMSkgKiByZXByZXNlbnRhdGlvbi5zZWdtZW50RHVyYXRpb247XG4gICAgICAgICAgICB1cmwgPSB0ZW1wbGF0ZS5tZWRpYTtcbiAgICAgICAgICAgIHVybCA9IHJlcGxhY2VUb2tlbkZvclRlbXBsYXRlKHVybCwgJ051bWJlcicsIHNlZy5yZXBsYWNlbWVudE51bWJlcik7XG4gICAgICAgICAgICB1cmwgPSByZXBsYWNlVG9rZW5Gb3JUZW1wbGF0ZSh1cmwsICdUaW1lJywgc2VnLnJlcGxhY2VtZW50VGltZSk7XG4gICAgICAgICAgICBzZWcubWVkaWEgPSB1cmw7XG5cbiAgICAgICAgICAgIHNlZ21lbnRzLnB1c2goc2VnKTtcbiAgICAgICAgICAgIHNlZyA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNOYU4oZHVyYXRpb24pKSB7XG4gICAgICAgICAgICByZXByZXNlbnRhdGlvbi5hdmFpbGFibGVTZWdtZW50c051bWJlciA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXByZXNlbnRhdGlvbi5hdmFpbGFibGVTZWdtZW50c051bWJlciA9IE1hdGguY2VpbCgoYXZhaWxhYmlsaXR5V2luZG93LmVuZCAtIGF2YWlsYWJpbGl0eVdpbmRvdy5zdGFydCkgLyBkdXJhdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2VnbWVudHM7XG4gICAgfVxuXG4gICAgaW5zdGFuY2UgPSB7XG4gICAgICAgIGdldFNlZ21lbnRzOiBnZXRTZWdtZW50c0Zyb21UZW1wbGF0ZVxuICAgIH07XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG59XG5cblRlbXBsYXRlU2VnbWVudHNHZXR0ZXIuX19kYXNoanNfZmFjdG9yeV9uYW1lID0gJ1RlbXBsYXRlU2VnbWVudHNHZXR0ZXInO1xuY29uc3QgZmFjdG9yeSA9IEZhY3RvcnlNYWtlci5nZXRDbGFzc0ZhY3RvcnkoVGVtcGxhdGVTZWdtZW50c0dldHRlcik7XG5leHBvcnQgZGVmYXVsdCBmYWN0b3J5O1xuIiwiLyoqXG4gKiBUaGUgY29weXJpZ2h0IGluIHRoaXMgc29mdHdhcmUgaXMgYmVpbmcgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBMaWNlbnNlLFxuICogaW5jbHVkZWQgYmVsb3cuIFRoaXMgc29mdHdhcmUgbWF5IGJlIHN1YmplY3QgdG8gb3RoZXIgdGhpcmQgcGFydHkgYW5kIGNvbnRyaWJ1dG9yXG4gKiByaWdodHMsIGluY2x1ZGluZyBwYXRlbnQgcmlnaHRzLCBhbmQgbm8gc3VjaCByaWdodHMgYXJlIGdyYW50ZWQgdW5kZXIgdGhpcyBsaWNlbnNlLlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMywgRGFzaCBJbmR1c3RyeSBGb3J1bS5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpc1xuICogIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICogIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yXG4gKiAgb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgRGFzaCBJbmR1c3RyeSBGb3J1bSBub3IgdGhlIG5hbWVzIG9mIGl0c1xuICogIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmVcbiAqICB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBBUyBJUyBBTkQgQU5ZXG4gKiAgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRFxuICogIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC5cbiAqICBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULFxuICogIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVRcbiAqICBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXG4gKiAgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksXG4gKiAgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKVxuICogIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXG4gKiAgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cblxuaW1wb3J0IEZhY3RvcnlNYWtlciBmcm9tICcuLi8uLi9jb3JlL0ZhY3RvcnlNYWtlci5qcyc7XG5cbmltcG9ydCB7Z2V0VGltZUJhc2VkU2VnbWVudCwgZGVjaWRlU2VnbWVudExpc3RSYW5nZUZvclRpbWVsaW5lfSBmcm9tICcuL1NlZ21lbnRzVXRpbHMuanMnO1xuXG5mdW5jdGlvbiBUaW1lbGluZVNlZ21lbnRzR2V0dGVyKGNvbmZpZywgaXNEeW5hbWljKSB7XG5cbiAgICBsZXQgdGltZWxpbmVDb252ZXJ0ZXIgPSBjb25maWcudGltZWxpbmVDb252ZXJ0ZXI7XG5cbiAgICBsZXQgaW5zdGFuY2U7XG5cbiAgICBmdW5jdGlvbiBnZXRTZWdtZW50c0Zyb21UaW1lbGluZShyZXByZXNlbnRhdGlvbiwgcmVxdWVzdGVkVGltZSwgaW5kZXgsIGF2YWlsYWJpbGl0eVVwcGVyTGltaXQpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gcmVwcmVzZW50YXRpb24uYWRhcHRhdGlvbi5wZXJpb2QubXBkLm1hbmlmZXN0LlBlcmlvZF9hc0FycmF5W3JlcHJlc2VudGF0aW9uLmFkYXB0YXRpb24ucGVyaW9kLmluZGV4XS5cbiAgICAgICAgICAgIEFkYXB0YXRpb25TZXRfYXNBcnJheVtyZXByZXNlbnRhdGlvbi5hZGFwdGF0aW9uLmluZGV4XS5SZXByZXNlbnRhdGlvbl9hc0FycmF5W3JlcHJlc2VudGF0aW9uLmluZGV4XS5TZWdtZW50VGVtcGxhdGU7XG4gICAgICAgIHZhciB0aW1lbGluZSA9IHRlbXBsYXRlLlNlZ21lbnRUaW1lbGluZTtcbiAgICAgICAgdmFyIGlzQXZhaWxhYmxlU2VnbWVudE51bWJlckNhbGN1bGF0ZWQgPSByZXByZXNlbnRhdGlvbi5hdmFpbGFibGVTZWdtZW50c051bWJlciA+IDA7XG5cbiAgICAgICAgdmFyIG1heFNlZ21lbnRzQWhlYWQgPSAxMDtcbiAgICAgICAgdmFyIHRpbWUgPSAwO1xuICAgICAgICB2YXIgc2NhbGVkVGltZSA9IDA7XG4gICAgICAgIHZhciBhdmFpbGFiaWxpdHlJZHggPSAtMTtcbiAgICAgICAgdmFyIHNlZ21lbnRzID0gW107XG4gICAgICAgIHZhciBpc1N0YXJ0U2VnbWVudEZvclJlcXVlc3RlZFRpbWVGb3VuZCA9IGZhbHNlO1xuXG4gICAgICAgIHZhciBmcmFnbWVudHMsXG4gICAgICAgICAgICBmcmFnLFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIGxlbixcbiAgICAgICAgICAgIGosXG4gICAgICAgICAgICByZXBlYXQsXG4gICAgICAgICAgICByZXBlYXRFbmRUaW1lLFxuICAgICAgICAgICAgbmV4dEZyYWcsXG4gICAgICAgICAgICBjYWxjdWxhdGVkUmFuZ2UsXG4gICAgICAgICAgICBoYXNFbm91Z2hTZWdtZW50cyxcbiAgICAgICAgICAgIHJlcXVpcmVkTWVkaWFUaW1lLFxuICAgICAgICAgICAgc3RhcnRJZHgsXG4gICAgICAgICAgICBlbmRJZHgsXG4gICAgICAgICAgICBmVGltZXNjYWxlO1xuXG4gICAgICAgIHZhciBjcmVhdGVTZWdtZW50ID0gZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRUaW1lQmFzZWRTZWdtZW50KFxuICAgICAgICAgICAgICAgIHRpbWVsaW5lQ29udmVydGVyLFxuICAgICAgICAgICAgICAgIGlzRHluYW1pYyxcbiAgICAgICAgICAgICAgICByZXByZXNlbnRhdGlvbixcbiAgICAgICAgICAgICAgICB0aW1lLFxuICAgICAgICAgICAgICAgIHMuZCxcbiAgICAgICAgICAgICAgICBmVGltZXNjYWxlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlLm1lZGlhLFxuICAgICAgICAgICAgICAgIHMubWVkaWFSYW5nZSxcbiAgICAgICAgICAgICAgICBhdmFpbGFiaWxpdHlJZHgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGZUaW1lc2NhbGUgPSByZXByZXNlbnRhdGlvbi50aW1lc2NhbGU7XG5cbiAgICAgICAgZnJhZ21lbnRzID0gdGltZWxpbmUuU19hc0FycmF5O1xuXG4gICAgICAgIGNhbGN1bGF0ZWRSYW5nZSA9IGRlY2lkZVNlZ21lbnRMaXN0UmFuZ2VGb3JUaW1lbGluZSh0aW1lbGluZUNvbnZlcnRlciwgaXNEeW5hbWljLCAgcmVxdWVzdGVkVGltZSwgaW5kZXgsIGF2YWlsYWJpbGl0eVVwcGVyTGltaXQpO1xuXG4gICAgICAgIC8vIGlmIGNhbGN1bGF0ZWRSYW5nZSBleGlzdHMgd2Ugc2hvdWxkIGdlbmVyYXRlIHNlZ21lbnRzIHRoYXQgYmVsb25nIHRvIHRoaXMgcmFuZ2UuXG4gICAgICAgIC8vIE90aGVyd2lzZSBnZW5lcmF0ZSBtYXhTZWdtZW50c0FoZWFkIHNlZ21lbnRzIGFoZWFkIG9mIHRoZSByZXF1ZXN0ZWQgdGltZVxuICAgICAgICBpZiAoY2FsY3VsYXRlZFJhbmdlKSB7XG4gICAgICAgICAgICBzdGFydElkeCA9IGNhbGN1bGF0ZWRSYW5nZS5zdGFydDtcbiAgICAgICAgICAgIGVuZElkeCA9IGNhbGN1bGF0ZWRSYW5nZS5lbmQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXF1aXJlZE1lZGlhVGltZSA9IHRpbWVsaW5lQ29udmVydGVyLmNhbGNNZWRpYVRpbWVGcm9tUHJlc2VudGF0aW9uVGltZShyZXF1ZXN0ZWRUaW1lIHx8IDAsIHJlcHJlc2VudGF0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoaSA9IDAsIGxlbiA9IGZyYWdtZW50cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgZnJhZyA9IGZyYWdtZW50c1tpXTtcbiAgICAgICAgICAgIHJlcGVhdCA9IDA7XG4gICAgICAgICAgICBpZiAoZnJhZy5oYXNPd25Qcm9wZXJ0eSgncicpKSB7XG4gICAgICAgICAgICAgICAgcmVwZWF0ID0gZnJhZy5yO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL0ZvciBhIHJlcGVhdGVkIFMgZWxlbWVudCwgdCBiZWxvbmdzIG9ubHkgdG8gdGhlIGZpcnN0IHNlZ21lbnRcbiAgICAgICAgICAgIGlmIChmcmFnLmhhc093blByb3BlcnR5KCd0JykpIHtcbiAgICAgICAgICAgICAgICB0aW1lID0gZnJhZy50O1xuICAgICAgICAgICAgICAgIHNjYWxlZFRpbWUgPSB0aW1lIC8gZlRpbWVzY2FsZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9UaGlzIGlzIGEgc3BlY2lhbCBjYXNlOiBcIkEgbmVnYXRpdmUgdmFsdWUgb2YgdGhlIEByIGF0dHJpYnV0ZSBvZiB0aGUgUyBlbGVtZW50IGluZGljYXRlcyB0aGF0IHRoZSBkdXJhdGlvbiBpbmRpY2F0ZWQgaW4gQGQgYXR0cmlidXRlIHJlcGVhdHMgdW50aWwgdGhlIHN0YXJ0IG9mIHRoZSBuZXh0IFMgZWxlbWVudCwgdGhlIGVuZCBvZiB0aGUgUGVyaW9kIG9yIHVudGlsIHRoZVxuICAgICAgICAgICAgLy8gbmV4dCBNUEQgdXBkYXRlLlwiXG4gICAgICAgICAgICBpZiAocmVwZWF0IDwgMCkge1xuICAgICAgICAgICAgICAgIG5leHRGcmFnID0gZnJhZ21lbnRzW2kgKyAxXTtcblxuICAgICAgICAgICAgICAgIGlmIChuZXh0RnJhZyAmJiBuZXh0RnJhZy5oYXNPd25Qcm9wZXJ0eSgndCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcGVhdEVuZFRpbWUgPSBuZXh0RnJhZy50IC8gZlRpbWVzY2FsZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXZhaWxhYmlsaXR5RW5kID0gcmVwcmVzZW50YXRpb24uc2VnbWVudEF2YWlsYWJpbGl0eVJhbmdlID8gcmVwcmVzZW50YXRpb24uc2VnbWVudEF2YWlsYWJpbGl0eVJhbmdlLmVuZCA6ICh0aW1lbGluZUNvbnZlcnRlci5jYWxjU2VnbWVudEF2YWlsYWJpbGl0eVJhbmdlKHJlcHJlc2VudGF0aW9uLCBpc0R5bmFtaWMpLmVuZCk7XG4gICAgICAgICAgICAgICAgICAgIHJlcGVhdEVuZFRpbWUgPSB0aW1lbGluZUNvbnZlcnRlci5jYWxjTWVkaWFUaW1lRnJvbVByZXNlbnRhdGlvblRpbWUoYXZhaWxhYmlsaXR5RW5kLCByZXByZXNlbnRhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIHJlcHJlc2VudGF0aW9uLnNlZ21lbnREdXJhdGlvbiA9IGZyYWcuZCAvIGZUaW1lc2NhbGU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmVwZWF0ID0gTWF0aC5jZWlsKChyZXBlYXRFbmRUaW1lIC0gc2NhbGVkVGltZSkgLyAoZnJhZy5kIC8gZlRpbWVzY2FsZSkpIC0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaWYgd2UgaGF2ZSBlbm91Z2ggc2VnbWVudHMgaW4gdGhlIGxpc3QsIGJ1dCB3ZSBoYXZlIG5vdCBjYWxjdWxhdGVkIHRoZSB0b3RhbCBudW1iZXIgb2YgdGhlIHNlZ21lbnRzIHlldCB3ZVxuICAgICAgICAgICAgLy8gc2hvdWxkIGNvbnRpbnVlIHRoZSBsb29wIGFuZCBjYWxjIHRoZSBudW1iZXIuIE9uY2UgaXQgaXMgY2FsY3VsYXRlZCwgd2UgY2FuIGJyZWFrIHRoZSBsb29wLlxuICAgICAgICAgICAgaWYgKGhhc0Vub3VnaFNlZ21lbnRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzQXZhaWxhYmxlU2VnbWVudE51bWJlckNhbGN1bGF0ZWQpIGJyZWFrO1xuICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eUlkeCArPSByZXBlYXQgKyAxO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKGogPSAwOyBqIDw9IHJlcGVhdDsgaisrKSB7XG4gICAgICAgICAgICAgICAgYXZhaWxhYmlsaXR5SWR4Kys7XG5cbiAgICAgICAgICAgICAgICBpZiAoY2FsY3VsYXRlZFJhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdmFpbGFiaWxpdHlJZHggPiBlbmRJZHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc0Vub3VnaFNlZ21lbnRzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0F2YWlsYWJsZVNlZ21lbnROdW1iZXJDYWxjdWxhdGVkKSBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGF2YWlsYWJpbGl0eUlkeCA+PSBzdGFydElkeCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VnbWVudHMucHVzaChjcmVhdGVTZWdtZW50KGZyYWcpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWdtZW50cy5sZW5ndGggPiBtYXhTZWdtZW50c0FoZWFkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNFbm91Z2hTZWdtZW50cyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNBdmFpbGFibGVTZWdtZW50TnVtYmVyQ2FsY3VsYXRlZCkgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIEluIHNvbWUgY2FzZXMgd2hlbiByZXF1aXJlZE1lZGlhVGltZSA9IGFjdHVhbCBlbmQgdGltZSBvZiB0aGUgbGFzdCBzZWdtZW50XG4gICAgICAgICAgICAgICAgICAgIC8vIGl0IGlzIHBvc3NpYmxlIHRoYXQgdGhpcyB0aW1lIGEgYml0IGV4Y2VlZHMgdGhlIGRlY2xhcmVkIGVuZCB0aW1lIG9mIHRoZSBsYXN0IHNlZ21lbnQuXG4gICAgICAgICAgICAgICAgICAgIC8vIGluIHRoaXMgY2FzZSB3ZSBzdGlsbCBuZWVkIHRvIGluY2x1ZGUgdGhlIGxhc3Qgc2VnbWVudCBpbiB0aGUgc2VnbWVudCBsaXN0LiB0byBkbyB0aGlzIHdlXG4gICAgICAgICAgICAgICAgICAgIC8vIHVzZSBhIGNvcnJlY3Rpb24gZmFjdG9yID0gMS41LiBUaGlzIG51bWJlciBpcyB1c2VkIGJlY2F1c2UgdGhlIGxhcmdlc3QgcG9zc2libGUgZGV2aWF0aW9uIGlzXG4gICAgICAgICAgICAgICAgICAgIC8vIGlzIDUwJSBvZiBzZWdtZW50IGR1cmF0aW9uLlxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNTdGFydFNlZ21lbnRGb3JSZXF1ZXN0ZWRUaW1lRm91bmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnRzLnB1c2goY3JlYXRlU2VnbWVudChmcmFnKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gIGVsc2UgaWYgKHNjYWxlZFRpbWUgPj0gKHJlcXVpcmVkTWVkaWFUaW1lIC0gKGZyYWcuZCAvIGZUaW1lc2NhbGUpICogMS41KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNTdGFydFNlZ21lbnRGb3JSZXF1ZXN0ZWRUaW1lRm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VnbWVudHMucHVzaChjcmVhdGVTZWdtZW50KGZyYWcpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRpbWUgKz0gZnJhZy5kO1xuICAgICAgICAgICAgICAgIHNjYWxlZFRpbWUgPSB0aW1lIC8gZlRpbWVzY2FsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaXNBdmFpbGFibGVTZWdtZW50TnVtYmVyQ2FsY3VsYXRlZCkge1xuICAgICAgICAgICAgcmVwcmVzZW50YXRpb24uYXZhaWxhYmxlU2VnbWVudHNOdW1iZXIgPSBhdmFpbGFiaWxpdHlJZHggKyAxO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNlZ21lbnRzO1xuICAgIH1cblxuICAgIGluc3RhbmNlID0ge1xuICAgICAgICBnZXRTZWdtZW50czogZ2V0U2VnbWVudHNGcm9tVGltZWxpbmVcbiAgICB9O1xuXG4gICAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG5UaW1lbGluZVNlZ21lbnRzR2V0dGVyLl9fZGFzaGpzX2ZhY3RvcnlfbmFtZSA9ICdUaW1lbGluZVNlZ21lbnRzR2V0dGVyJztcbmNvbnN0IGZhY3RvcnkgPSBGYWN0b3J5TWFrZXIuZ2V0Q2xhc3NGYWN0b3J5KFRpbWVsaW5lU2VnbWVudHNHZXR0ZXIpO1xuZXhwb3J0IGRlZmF1bHQgZmFjdG9yeTtcbiIsIi8qKlxuICogVGhlIGNvcHlyaWdodCBpbiB0aGlzIHNvZnR3YXJlIGlzIGJlaW5nIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgTGljZW5zZSxcbiAqIGluY2x1ZGVkIGJlbG93LiBUaGlzIHNvZnR3YXJlIG1heSBiZSBzdWJqZWN0IHRvIG90aGVyIHRoaXJkIHBhcnR5IGFuZCBjb250cmlidXRvclxuICogcmlnaHRzLCBpbmNsdWRpbmcgcGF0ZW50IHJpZ2h0cywgYW5kIG5vIHN1Y2ggcmlnaHRzIGFyZSBncmFudGVkIHVuZGVyIHRoaXMgbGljZW5zZS5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMsIERhc2ggSW5kdXN0cnkgRm9ydW0uXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sXG4gKiBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gKiAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAqICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAqICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vclxuICogIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKiAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIERhc2ggSW5kdXN0cnkgRm9ydW0gbm9yIHRoZSBuYW1lcyBvZiBpdHNcbiAqICBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlXG4gKiAgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgQVMgSVMgQU5EIEFOWVxuICogIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRURcbiAqICBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuXG4gKiAgSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcbiAqICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUXG4gKiAgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUlxuICogIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLFxuICogIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcbiAqICBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRVxuICogIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG4vKipcbiAqIEBjbGFzc1xuICogQGlnbm9yZVxuICovXG5jbGFzcyBTZWdtZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5pbmRleFJhbmdlID0gbnVsbDtcbiAgICAgICAgdGhpcy5pbmRleCA9IG51bGw7XG4gICAgICAgIHRoaXMubWVkaWFSYW5nZSA9IG51bGw7XG4gICAgICAgIHRoaXMubWVkaWEgPSBudWxsO1xuICAgICAgICB0aGlzLmR1cmF0aW9uID0gTmFOO1xuICAgICAgICAvLyB0aGlzIGlzIHRoZSB0aW1lIHRoYXQgc2hvdWxkIGJlIGluc2VydGVkIGludG8gdGhlIG1lZGlhIHVybFxuICAgICAgICB0aGlzLnJlcGxhY2VtZW50VGltZSA9IG51bGw7XG4gICAgICAgIC8vIHRoaXMgaXMgdGhlIG51bWJlciB0aGF0IHNob3VsZCBiZSBpbnNlcnRlZCBpbnRvIHRoZSBtZWRpYSB1cmxcbiAgICAgICAgdGhpcy5yZXBsYWNlbWVudE51bWJlciA9IE5hTjtcbiAgICAgICAgLy8gVGhpcyBpcyBzdXBwb3NlZCB0byBtYXRjaCB0aGUgdGltZSBlbmNvZGVkIGluIHRoZSBtZWRpYSBTZWdtZW50XG4gICAgICAgIHRoaXMubWVkaWFTdGFydFRpbWUgPSBOYU47XG4gICAgICAgIC8vIFdoZW4gdGhlIHNvdXJjZSBidWZmZXIgdGltZU9mZnNldCBpcyBzZXQgdG8gTVNFVGltZU9mZnNldCB0aGlzIGlzIHRoZVxuICAgICAgICAvLyB0aW1lIHRoYXQgd2lsbCBtYXRjaCB0aGUgc2Vla1RhcmdldCBhbmQgdmlkZW8uY3VycmVudFRpbWVcbiAgICAgICAgdGhpcy5wcmVzZW50YXRpb25TdGFydFRpbWUgPSBOYU47XG4gICAgICAgIC8vIERvIG5vdCBzY2hlZHVsZSB0aGlzIHNlZ21lbnQgdW50aWxcbiAgICAgICAgdGhpcy5hdmFpbGFiaWxpdHlTdGFydFRpbWUgPSBOYU47XG4gICAgICAgIC8vIElnbm9yZSBhbmQgIGRpc2NhcmQgdGhpcyBzZWdtZW50IGFmdGVyXG4gICAgICAgIHRoaXMuYXZhaWxhYmlsaXR5RW5kVGltZSA9IE5hTjtcbiAgICAgICAgLy8gVGhlIGluZGV4IG9mIHRoZSBzZWdtZW50IGluc2lkZSB0aGUgYXZhaWxhYmlsaXR5IHdpbmRvd1xuICAgICAgICB0aGlzLmF2YWlsYWJpbGl0eUlkeCA9IE5hTjtcbiAgICAgICAgLy8gRm9yIGR5bmFtaWMgbXBkJ3MsIHRoaXMgaXMgdGhlIHdhbGwgY2xvY2sgdGltZSB0aGF0IHRoZSB2aWRlb1xuICAgICAgICAvLyBlbGVtZW50IGN1cnJlbnRUaW1lIHNob3VsZCBiZSBwcmVzZW50YXRpb25TdGFydFRpbWVcbiAgICAgICAgdGhpcy53YWxsU3RhcnRUaW1lID0gTmFOO1xuICAgICAgICB0aGlzLnJlcHJlc2VudGF0aW9uID0gbnVsbDtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNlZ21lbnQ7Il19
