class SRDownloaderProvider {

    disposeDownloader() {
        if (this._downloader) {
            this._downloader.dispose();
        }
    }

    get downloader() {
        return this._downloader;
    }

    set downloader(value) {
        this._downloader = value;
    }
}

export default SRDownloaderProvider;