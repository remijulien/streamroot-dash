import ManifestHelper from './ManifestHelper';
import MediaMap from './MediaMap';

class DashjsWrapper {

    constructor (player) {
        this._player = player;

        var manifestHelper = new ManifestHelper(player);

        var mediaMap = new MediaMap(manifestHelper);
    }
}

export default DashjsWrapper;
