import ManifestHelper from './ManifestHelper';
import MediaMap from './MediaMap';
import PlayerInterface from './PlayerInterface';
import SegmentView from './SegmentView';
import SRFragmentLoaderClassProvider from './SRFragmentLoaderClassProvider';

class DashjsWrapper {

    constructor (player, videoElement, p2pConfig, liveDelay) {
        this._player = player;
        this._videoElement = videoElement;
        this._p2pConfig = p2pConfig;

        this._liveDelay = liveDelay;
        this._player.setLiveDelay(liveDelay);

        const fragmentLoaderClass = new SRFragmentLoaderClassProvider(this).SRFragmentLoader;
        this._player.extend("FragmentLoader", fragmentLoaderClass, true);

        this._player.on(dashjs.MediaPlayer.events.MANIFEST_LOADED, this._onManifestLoaded, this);
    }

    get srDownloader() {
        return this._srDownloader;
    }

    _onManifestLoaded ({ data }) {

        if (!data) {
            return; // event fires twice when manifest is changed, first time the data is null
        }

        //TODO: we don't know if this event may fire on live streams with same manifest url. if it doesn't, we should remove this check
        if (this._manifest && data.url === this._manifest.url) {
            return;
        }

        this._manifest = data;

        if (this._srDownloader) {
            this._srDownloader.dispose();
        }

        let manifestHelper = new ManifestHelper(this._player, this._manifest);
        let playerInterface = new PlayerInterface(this._player, manifestHelper, this._liveDelay);
        let mediaMap = new MediaMap(manifestHelper);

        this._srDownloader = new window.Streamroot.Downloader(
            playerInterface,
            this._manifest.url,
            mediaMap,
            this._p2pConfig,
            SegmentView,
            this._videoElement
        );
    }
}

export default DashjsWrapper;
