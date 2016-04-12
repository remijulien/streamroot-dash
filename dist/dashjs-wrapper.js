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