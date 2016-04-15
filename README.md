# streamroot-dash

Streamroot p2p module wrapper for dash.js. It enables [Streamroot's p2p](http://streamroot.io) solution for [dash.js](https://github.com/Dash-Industry-Forum/dash.js).

## Quick start

1. Clone this repo `git clone https://github.com/streamroot/streamroot-dash.git`
1. Install library dependecies `npm install`
1. Build the library `grunt build`. Result will be here `dist/dashjs-wrapper.js`.
1. Include `streamroot-p2p` lib, `dashjs-wrapper.js` and `dash.js` in your web page:
  
  **The supported version of dahs.js -- v2.1 has not been released yet, so you'll have to use official nightly build for now, either its [minified](http://dashif.org/reference/players/javascript/nightly/dash.js/dist/dash.all.min.js) or [debug](http://dashif.org/reference/players/javascript/nightly/dash.js/dist/dash.all.debug.js) version.**  
  **After dash.js v2.1 release you can use official build obtained from `npm` or dash.js CDN.**  
  **Release of 2.1 is on the way, and currently there is [RC3 v2.1 branch](https://github.com/Dash-Industry-Forum/dash.js/tree/RC3_v2.1.0) which has all the features requierd by this library, so if you are confident with building `dash.js`, you can build it from this branch.**

  ```html
  <head>
    <!-- path to dash.js build here -->
    <script src="http://dashif.org/reference/players/javascript/nightly/dash.js/dist/dash.all.debug.js"></script>

    <!-- Streamroot p2p lib -->
    <script src="http://lib.streamroot.io/3/p2p.js"></script>

    <!-- path to streamroot-dash build aka Streamroot p2p dash.js wrapper -->
    <script src="dashjs-wrapper.js"></script>
  </head>
  ```
1. Create dash.js MediaPlayer instance and initialize the wrapper

  ```javascript
  <body>

      <div>
          <video id="videoPlayer" width="480" height="360" controls muted></video>
      </div>

      <script>
          (function() {
              var videoElementId = "videoPlayer";
              var videoElement = document.getElementById(videoElementId);

              var player = dashjs.MediaPlayer().create();

              var p2pConfig = {
                  streamrootKey: YOUR_STREAMROOT_KEY_HERE,
                  debug: true //true if you want to see debug messages in browser console, false otherwise
              };

              var liveDelay = 30; //TODO: hardcoded value, will be fixed in future relases
              var dashjsWrapper = new DashjsWrapper(player, videoElement, p2pConfig, liveDelay);

              var manifestURL = "put MPEG-DASH manifest url here";
              var autoStart = true;
              player.initialize(videoElement, manifestURL, autoStart);
          })();
      </script>
  </body>
  ```

1. Specify you streamroot key in p2p config object. If you don't have it, go to [Streamroot's dashboard](http://dashboard.streamroot.io/) and sign up. It's free.

1. To see some p2p traffic open several browser tabs/windows playing the same manifest(so there will be peers to exchange p2p traffic).

You can check live example [here](http://streamroot.github.io/streamroot-dash/demo/demo.html)
