import log from 'loglevel';
import loadScript from 'simple-load-script';
// import { isVisible } from 'element-is-visible';
import { VASTParser } from 'vast-client';
import { nodeURLHandler } from 'vast-client/src/urlhandlers/mock_node_url_handler';
import { XHRURLHandler } from 'vast-client/src/urlhandlers/xhr_url_handler';
import MoovlahTracker from '../tracking';
// import MoovlahPlacement from '../moovlah-player/moovlah-placement';
import { camelize, uncamelize, serializeParams } from '../util/strings';
import { animateDivPadding, animateDivHeight } from '../util/dom';

const withinviewport = require('withinviewport');

export default class MoovlahPlayer {

  constructor(opts) {

    this.logSettings = {
      logLevel: `debug`
    };

    if(opts.logSettings && opts.logSettings.logLevel) {
      this.logSettings.logLevel = opts.logSettings.logLevel;
    }

    this.inIFrame = window !== window.top;

    this.embeddingPage = this.inIFrame ? window.referrer : window.document.location;

    this.tracker = new MoovlahTracker({
      trackers: {
        gtag: ['G-JJLJFMKR04'],
        google_analytics: ['UA-172822330-1', 'UA-172822330-2']
      },
      dimensions: {
        placement_domain: window.top.location.host,
      },
      loglevel: this.logSettings.logLevel
    });

    this.urlHandler = {};

    this.intersectionSettings = {
      threshold: [0, 0.5],
      rootMargin: `0px 0px 0px 0px`
    };

    this.playerSettings = {
      embedTag: null,
      placement: ``,
      configurationKey: ``,
      stickinessDismissed: false,
      firstVisible: false,
      frameLoaded: false,
      playerLoaded: false,
      playerInstantiated: false,
      componentReady: false,
      inViewport: false
    };

    this.adsResponse = [];

    this.pageState = {
      tabFocus: true
    };

    this.playerState = {
      inView: true
    };

    this.scriptTag = null;

    this.intersectionObserver = null;
    this.messageBus = null;

    this.log = log;

    this.playerStyles = {
      responsiveContainerStyle: `position: relative;padding-bottom: 56.25%;height: 0;overflow: hidden;text-align:center;`,
      hiddenContainerStyle: `position: relative;padding-bottom: 0%;height: 0;overflow: hidden;text-align:center;`,
      responsiveFrameStyle: `position: absolute;top: 0;left: 0;width: 100%;height: 100%;`,
      floatingFrameStyle: `z-index:10000; box-shadow: 0 3px 4px 0 rgba(0,0,0,0.14), 0 3px 3px -2px rgba(0,0,0,0.12), 0 1px 8px 0 rgba(0,0,0,0.20); position: fixed; right: 20px; bottom: 20px; top: auto; left: auto; max-width: 280px; max-height: 158px; width: 280px; height: 158px;`,
      floatingFrameStyleBottomLeft: `left: 20px; right: auto; bottom: 20px; top: auto;`,
      floatingFrameStyleBottomRight: `right: 20px; left: auto; bottom: 20px; top: auto;`,
      floatingFrameStyleTopLeft: `left: 20px; right: auto; top: 20px; bottom: auto;`,
      floatingFrameStyleTopRight: `right: 20px; left: auto; top: 20px; bottom: auto;`,
      floatingFrameStyleMiddleLeft: `left: 20px; right: auto; bottom: 50%; top: auto;`,
      floatingFrameStyleMiddleRight: `right: 20px; left: auto; bottom: 50%; top: auto;`,
      placeholderImageStyle: `cursor:pointer`,
      closeButton: `position: absolute; display: block; right: -12px; bottom: auto; top: -12px; left: auto; cursor: pointer; fill: rgba(0,0,0,1); height: 24px; width: 24px;`,
      playButton: `position: absolute; width: 96px; height: 96px; left: 50%; top: 50%; margin-left: -48px; margin-top: -48px;`
    };

    this.pageProperties = {

    };

    if (typeof document.hidden !== `undefined`) {
      this.pageProperties.hidden = `hidden`;
      this.pageProperties.visibilityChange = `visibilitychange`;
    } else if (typeof document.mozHidden !== `undefined`) { // Firefox up to v17
      this.pageProperties.hidden = `mozHidden`;
      this.pageProperties.visibilityChange = `mozvisibilitychange`;
    } else if (typeof document.webkitHidden !== "undefined") { // Chrome up to v32, Android up to v4.4, Blackberry up to v10
      this.pageProperties.hidden = `webkitHidden`;
      this.pageProperties.visibilityChange = `webkitvisibilitychange`;
    }

    this.vastResponse = null;

    this.playbackProperties = {
      isPlaying: false,
      isAdPlaying: false,
      currentItem: null
    };

    this.allowableParams = [
        `anchorCorner`,
        `autoPlay`,
        `config`,
        `configurationKey`,
        `target`,
        `targetElement`,
        `clip`,
        `sticky`,
        `scrollToPlay`,
        `mute`,
        `playsInline`,
        `videoFormat`,
        `singlePlayer`,
        `shuffle`,
        `adTagOverride`,
        `searchContext`,
        `ignoreAdBlocker`,
        `deferToOVP`,
    ];

    for(let section in opts) {
      for(let setting in opts[section]) {
        if(this[section].hasOwnProperty(setting)) {
          this[section][setting] = opts[section][setting];
        }
      }
    }

    document.addEventListener(this.pageProperties.visibilityChange, this.handleVisibilityChange.bind(this), false);
    if(window.addEventListener) {
      window.addEventListener(`message`, this.handlePostMessage.bind(this),false);
      /**
      window.addEventListener('focus', this.handleFocusChange.bind(this), false);
      window.addEventListener('blur', this.handleFocusChange.bind(this), false);
      window.addEventListener('pageshow', this.handleFocusChange.bind(this), false);
      window.addEventListener('pagehide', this.handleFocusChange.bind(this), false);
      */
    } else {
      window.attachEvent(`onmessage`, this.handlePostMessage.bind(this),false);
      /**
      window.attachEvent('focus', this.handleFocusChange.bind(this), false);
      window.attachEvent('blur', this.handleFocusChange.bind(this), false);
      window.attachEvent('pageshow', this.handleFocusChange.bind(this), false);
      window.attachEvent('pagehide', this.handleFocusChange.bind(this), false);
      */
    }

    // this.log.setDefaultLevel("trace");
    this.log.enableAll();
    this.log.warn(`player logger at level`, this.log.getLevel(), this.logSettings.logLevel);

    this.scriptTag = document.currentScript || (function() {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

    this.log.debug(`have scriptTag`, this.scriptTag);

    this.bootstrapPlacement();

  }

  constructVASTTag(ad) {
    //https://securepubads.g.doubleclick.net/gampad/ads?env=vp&gdfp_req=1&output=vast&iu=/1234/video-demo&sz=400x300&unviewed_position_start=1&ciu_szs=728x90,300x250
    let tag = `https://securepubads.g.doubleclick.net/gampad/ads?iu=/${ad.network_id}/${ad.ad_unit_code}`;
    tag += `&env=vp`;
    tag += `&gdfp_req=1`;
    tag += `&output=xml_vast4`;
    tag += `&sz=640x480`;
    tag += `&unviewed_position_start=1`;
    tag += `&ltd=1`;
    tag += `&cmsid=2564115&vid=${this.playerSettings.placement.playlist[0].id}`;
    tag += `&correlator=` + Date.now();
    tag += '&description_url=' + encodeURIComponent(this.embeddingPage);
    tag += '&url=' + encodeURIComponent(this.embeddingPage);
    tag += `&msid=&an=`;
    tag += `&npa=1`;
    tag += `&vpos=preroll`
    tag += `&wta=1`;
    return tag;
  }

  async getAds() {
    // console.info(`getAds`, this.playerSettings.placement);
    this.urlHandler.get = this.getVastResponse.bind(this);
    this.vastParser = new VASTParser();


    if(this.playerSettings.placement.ads[0].ad_unit_id) {
      console.info(`have ad id, constructing vast tag`, this.playerSettings.placement.ads[0]);
      this.playerSettings.placement.ads[0].tag = this.constructVASTTag(this.playerSettings.placement.ads[0]);
    }

    //this.playerSettings.placement.ads[0].tag += Date.now();
    console.info(`parsing vast`, this.playerSettings.placement.ads[0].tag);

    try {
      const resp = await this.vastParser.getAndParseVAST(this.playerSettings.placement.ads[0].tag, {
        urlHandler: this.urlHandler
      });
      this.adsResponse = resp.ads;
      // console.info(`got ads`, this.adsResponse);
      return true;
    } catch(e) {
      // console.error(`error`, e);
      return false;
    }
  }

  getVastResponse (url, options, cb) {
    console.info(`getVastResponse`)
    // Allow skip of the options param
    if (!cb) {
      if (typeof options === 'function') {
        cb = options
      }
      options = {}
    }

    if (typeof window === 'undefined' || window === null) {
      return nodeURLHandler.get(url, options, (error, xml, details = {}) => {
        // console.info(`in node here`, error, xml, details)
        const s = new XMLSerializer()
        this.vastResponse = s.serializeToString(xml)
        // console.info(`vr`, this.vastResponse)
        return cb(error, xml, details)
      })
    } else if (XHRURLHandler.supported()) {
      return XHRURLHandler.get(url, options, (error, xml, details = {}) => {
        // console.info(`in xhr here`, error, xml, details)
        // console.info(xml)
        const s = new XMLSerializer()
        this.vastResponse = s.serializeToString(xml)
        // console.info(`vr`, this.vastResponse)
        return cb(error, xml, details)
      })
    }
    return cb(
      new Error(
        'Current context is not supported by any of the default URLHandlers. Please provide a custom URLHandler'
      )
    )
  }

  handleVisibilityChange() {
    this.log.debug(`handleVisibilityChange`);
    if (document[this.pageProperties.hidden]) {
      this.log.debug(`handleVisibilityChange hidden`);
      this.frame && this.frame.contentWindow && this.frame.contentWindow.postMessage(JSON.stringify({
        msg: `pause_video`
      }), `*`);
    } else {
      this.log.debug(`handleVisibilityChange visible`);
      this.frame && this.frame.contentWindow && this.frame.contentWindow.postMessage(JSON.stringify({
        msg: `resume_video`
      }), `*`);
    }
  }

  async bootstrapPlacement() {
    if(!window.google || !window.google.ima) {
      try {
        /* const scriptRef = */ const ima3 = await loadScript('//imasdk.googleapis.com/js/sdkloader/ima3.js');
        console.warn(`ima loaded`, window.google);
      } catch (err) {
        console.error(`Error loading IMA SDK::` + err);
        return;
      }
    } else {
      console.warn(`ima pre-existing`, window.google.ima);
    }

    this.getConfiguration();

    this.log.debug(`have config`, this.playerSettings.placement);

    return this.initPlacement();
  }

  handleFocusChange(e) {
    this.log.debug(`handleFocusChange`, e);
    if ({ focus: 1, pageshow: 1 }[e.type]) {
        this.log.debug(`focused`, e.type);
        if (this.playerState.inView) return;
        this.pageState.tabFocus = true;
        this.playerState.inView = true;
        this.frame && this.frame.contentWindow && this.frame.contentWindow.postMessage(JSON.stringify({
          msg: `resume_video`
        }), `*`);
    } else if (this.playerState.inView) {
        this.log.debug(`focused`, e.type);
        this.pageState.tabFocus = !this.tabFocus;
        this.playerState.inView = false;
        this.frame && this.frame.contentWindow && this.frame.contentWindow.postMessage(JSON.stringify({
          msg: `pause_video`
        }), `*`);
    }
  }

  handlePostMessage(e) {
    let msg;
    try {
      msg = JSON.parse(e.data);
      this.log.info(`parent received message`,e.data);
    } catch(err) {
      // log.warn(`msg is not json`, err, e);
      msg = { msg: e.data };
    }
    this.log.info(`after parse`, msg);
    if(msg.msg === `player_ready`) {
      this.log.info(`player is loaded`);
      this.playerSettings.playerLoaded = true;
    }
  }

  createPlayerElements() {
    this.container = document.createElement(`div`);
    this.container.setAttribute(`id`, `moovlah-player`);
    this.frameHolder = document.createElement(`div`);
    this.frameHolder.setAttribute(`class`, `moovlah-frameHolder`);
    this.placeHolder = document.createElement(`div`);
    this.placeHolder.setAttribute(`class`, `moovlah-placeHolder`);
    this.frame = document.createElement(`iframe`);
    this.playerComponent = document.createElement(`moovlah-placement`);
    this.playBtn = document.createElement(`img`);
    this.playBtn.setAttribute(`src`, `https://p.moovlah.io/img/play-btn.png`);
    this.playBtn.setAttribute(`style`, this.playerStyles.playButton);
    this.closeBtn = document.createElement(`img`);
    this.closeBtn.setAttribute(`src`, `https://p.moovlah.io/img/close_gray.png`);
    this.closeBtn.setAttribute(`style`, this.playerStyles.closeButton);
    this.closeBtn.onclick = (e) => {
      this.log.info(`onclick of button`, withinviewport(this.container));
      if(!withinviewport(this.container)) {
        this.log.info(`onclick of button not in viewport`);
        this.frame && this.frame.contentWindow && this.frame.contentWindow.postMessage(JSON.stringify({
          msg: `pause_video`
        }), `*`);
      }
      if(this.playerSettings.placement.sticky) {

        this.frameHolder.style = this.playerStyles.responsiveFrameStyle;
        this.frameHolder.removeChild(this.closeBtn);
        this.playerSettings.stickinessDismissed = true;
      }
    };
  }

  getConfiguration() {
    this.log.debug(`getConfiguration`, this.playerSettings);

    if(this.playerSettings.placement) {
      this.log.debug(`getConfiguration have string placement`, this.playerSettings.placement);
      try {
        if(typeof this.playerSettings.placement === `string`) {
          this.playerSettings.placementString = this.playerSettings.placement;
          this.playerSettings.placement = JSON.parse(atob(this.playerSettings.placement));
          if(this.playerSettings.placement.placement) {
            this.playerSettings.placement = this.playerSettings.placement.placement;
          }
          this.playerSettings.configurationKey = this.playerSettings.placement.id;
        }
        this.tracker.updateDimensions({
          placement_id: this.playerSettings.configurationKey
        });
        this.tracker.trackEvent({
          eventCategory: 'Placement',
          eventLabel: this.playerSettings.configurationKey,
          eventAction: `code_executing`,
          eventValue: performance.now()
        });
        if(this.playerSettings.placement.gaTrackingId) {
          this.tracker.addTracker({
            google_analytics: Array.isArray(this.playerSettings.placement.gaTrackingId) ? this.playerSettings.placement.gaTrackingId : [ this.playerSettings.placement.gaTrackingId ]
          });
        }
        return true;
      } catch(e) {
        this.log.error(`Error parsing passed-in config`, e);
        this.tracker.trackEvent({
          eventCategory: 'Placement',
          eventLabel: this.playerSettings.configurationKey,
          eventAction: `configuration_parse_error`,
          eventValue: e
        });
      }
    } else {
      const scriptAttrs = this.embedTag.dataset;
      try {
        this.playerSettings.configurationKey = scriptAttrs['configuration-key'];
        return this.configurationFromKey();
      } catch(e) {
        this.log.error(`Error getting configKey`, e);
        this.tracker.trackEvent({
          eventCategory: 'Placement',
          eventLabel: this.playerSettings.configurationKey,
          eventAction: `configuration_load_error`,
          eventValue: e
        });
      }
    }
  }

  getOverrideParams() {
    const scriptSrc = this.embedTag.getAtribute(`src`);
    const scriptAttrs = this.embedTag.dataset;
    this.log.debug(`have script src`, scriptSrc);
    this.log.debug(`have script attrs`, scriptAttrs);
    const scriptSrcUrl = new URL(scriptSrc);
    this.log.debug(`have script src url`, scriptSrcUrl);
    const scriptUrlParams = scriptSrcUrl.searchParams;
    for (let p of this.allowableParams) {
      if(scriptUrlParams[p]) {
        this.log.debug(`overriding param from url`, p, scriptUrlParams[p]);
        this.playerSettings.placement[p] = scriptUrlParams[p];
      }
      if(scriptAttrs[camelize(p)]) {
        this.log.debug(`overriding param from tag`, camelize(p), scriptUrlParams[p]);
        this.playerSettings.placement[camelize(p)] = scriptUrlParams[p];
      }
    }
    this.log.debug(`overridden`, this.playerSettings.placement);
    return;
  }

  detectCollisions() {
    const foundEmbeds = document.querySelectorAll('iframe');
    this.log.debug('foundAds', foundEmbeds);

    const existingEmbeds = Array.from(foundEmbeds).filter((iframe) => {
      this.log.debug('foundEmbed', iframe);
      if(iframe.getAttribute('src') && iframe.getAttribute('src').length > 0) {
        return iframe.getAttribute('src').match(/^(?:https?:\/\/)?(?:[^.]+\.)?(vimeo|youtube|jwplayer|brightcove|youtu)\.(com|be)(\/.*)?$/g);
      }
    });
    return existingEmbeds;
  }

  paramsFromAttributes() {
    const scriptAttrs = this.embedTag.dataset;
    this.log.debug(`have script attrs`, scriptAttrs);
    for (let p of scriptAttrs) {
      if(tag.dataset[i]) {
      //if(tag.hasAttribute(uncamelize(i))) {
        log.info(`paramsFromTag::setting param`, i, tag.dataset[i]);
        //params[i] = tag.getAttribute(uncamelize(i));
        params[i] = tag.dataset[i];
      }
    }
    return;
  }

  async initPlacement() {

    await this.getAds();
    this.log.info(`have ads`, this.adsResponse, this.playerSettings.placement.showIfNoAds);
    if(this.adsResponse.length === 0 && !this.playerSettings.placement.showIfNoAds) {
      this.tracker.trackEvent({
        eventCategory: 'Placement',
        eventLabel: this.playerSettings.configurationKey,
        eventAction: `load_aborted`,
        eventValue: `no ads returned`
      });
      return;
    }
    this.createPlayerElements();
    this.embedElement = this.playerSettings.placement.targetElement ? document.querySelector(this.playerSettings.placement.targetElement) : this.scriptTag.parentNode;
    // this.log.info(`embedElement`, this.playerSettings.placement.targetElement, this.embedElement, this.scriptTag, this.scriptTag.parentNode);
    if(!this.embedElement) {
      this.tracker.trackEvent({
        eventCategory: 'Placement',
        eventLabel: this.playerSettings.configurationKey,
        eventAction: `load_aborted`,
        eventValue: `embed element not in dom`
      });
      return;
    }
    this.playbackProperties.currentItem = this.playerSettings.placement.playlist[0];
    this.placeholderImage = document.createElement('picture');
    this.placeholderImage.setAttribute(`style`, this.playerStyles.placeholderImageStyle);
    const szes = [1080, 720, 480, 360];
    szes.map((sze) => {
      const src = document.createElement(`source`);
      const sizedSrc = this.playbackProperties.currentItem[`poster_${sze}`];
      this.log.debug(`sizedSrc`, sizedSrc);
      src.setAttribute(`type`, `image/jpeg`);
      src.setAttribute(`srcset`, sizedSrc);
      src.setAttribute(`width`, `100%`);
      this.placeholderImage.appendChild(src);
    });
    const img = document.createElement(`img`);
    img.setAttribute(`src`, this.playbackProperties.currentItem.poster_480);
    img.setAttribute(`alt`, this.playbackProperties.currentItem.name);
    this.placeholderImage.appendChild(img);

    this.placeHolder.appendChild(this.placeholderImage);
    // this.placeHolder.appendChild(this.playBtn);
    this.container.setAttribute(`style`, this.playerStyles.hiddenContainerStyle);
    //this.container.appendChild(this.placeHolder);

    this.embedElement.prepend(this.container);
    /**
    this.componentScript = document.createElement(`script`);
    this.componentScript.setAttribute(`src`, `/js/moovlah-placement.min.js`);
    this.componentScript.onLoad = (e) => {
      this.log.info(`componentLoaded`, e);
      this.playerSettings.componentReady = true;
    }
    this.embedElement.prepend(this.componentScript);
    */
    this.log.info(`player settings`, this.playerSettings);
    this.setUpPlayer();
    window.requestAnimationFrame(this.beginIntersectionObserver.bind(this));
  }

  placementFromConfigKey() {
    this.log.info(`placementFromConfigKey`, this.playerSettings.configurationKey);
  }

  showPosterPlaceholder() {
    this.log.info(`showPosterPlaceholder`, this.playerSettings.playlist);
  }

  onPlayerExitViewport() {
    this.log.info(`onPlayerExitViewport`,this.playerSettings.placement.sticky, this.playerSettings.stickinessDismissed, );
    this.playerSettings.inViewport = false;
    if(!this.playerSettings.placement.sticky || this.playerSettings.stickinessDismissed || !this.playerSettings.firstVisible) {
      this.log.info(`not stick or dismissed`, this.playerSettings.placement.sticky, this.playerSettings.stickinessDismissed, this.playerSettings.firstVisible);
      this.frame && this.frame.contentWindow && this.frame.contentWindow.postMessage(JSON.stringify({
        msg: `player_exited_viewport`
      }), `*`);
      return;
    }
    this.log.info(`onPlayerExitViewport`);
    const  qStyle = this.playerSettings.placement.anchorCorner ? this.playerSettings.placement.anchorCorner.split(`-`).map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(``) : ``;
    const quadrantStyle = `floatingFrameStyle${qStyle}`;
    this.log.info(`quadrantStyle`, quadrantStyle);
    const fStyle = `${this.playerStyles.floatingFrameStyle}${this.playerStyles[quadrantStyle]}`;
    log.info(`fStyle`, fStyle);
    this.frameHolder.appendChild(this.closeBtn);
    this.frameHolder.setAttribute(`style`, fStyle);
    // this.container.appendChild(this.placeHolder);
  }

  onPlayerEnterViewport() {
    this.log.info(`onPlayerEnterViewport`);
    this.playerSettings.inViewport = true;
    this.frame && this.frame.contentWindow && this.frame.contentWindow.postMessage(JSON.stringify({
      msg: `player_entered_viewport`
    }), `*`);
    if(this.playerSettings.firstVisible) {
      this.log.info(`onPlayerEnterViewport firstVisible`);

      this.frameHolder.setAttribute(`style`, this.playerStyles.responsiveFrameStyle);
      try {
        this.frameHolder.removeChild(this.closeBtn);
      } catch(e) {
        //Nothing just a race condition
      }
      // this.container.removeChild(this.placeHolder);
    }
  }

  constructIframeSrc(params) {
    this.log.info(`constructIframeSrc`, params);
    params.logLevel = `debug`;
    const pars = serializeParams(params);
    this.log.info(`constructIframeSrc::serialized`, pars);
    return `${process.env.PLAYER_DOMAIN}/`;
    //return `${process.env.PLAYER_DOMAIN}/${this.playerSettings.configurationKey}?${pars}`;
  };

  onFrameLoaded() {
    this.log.info(`onFrameLoaded`, this.playerSettings, this.embedElement, withinviewport(this.container));
    /**
    this.frameHolder.setAttribute(`style`, this.playerStyles.responsiveFrameStyle);
    this.container.setAttribute(`style`, this.playerStyles.responsiveContainerStyle);
    this.frame.setAttribute(`style`, `height:100%;width:100%;`);
    */
    this.playerSettings.frameLoaded = true;

    if(withinviewport(this.container)) {
      this.log.info(`player visible on load`);
      this.playerSettings.firstVisible = true;
      this.initPlayer();
    }

    this.tracker.trackEvent({
      eventCategory: 'Placement',
      eventLabel: this.playerStyles.configurationKey,
      eventAction: `frame_loaded`,
      eventValue: null
    });

    //this.container.removeChild(this.placeHolder);
  }

  initPlayer() {
    this.log.info(`initPlayer`)
    this.frame && this.frame.contentWindow && this.frame.contentWindow.postMessage(JSON.stringify({
      msg: `configure_player`,
      data: {
        autoplay: this.playerSettings.placement.autoPlay,
        ads: this.playerSettings.placement.ads,
        mute: this.playerSettings.placement.mute,
        playlist: this.playerSettings.placement.playlist,
        adsResponse: this.vastResponse
      }
    }), `${process.env.PLAYER_DOMAIN}`);

    animateDivPadding({
			duration: 150,
			newHeight: 56.25,
			div: this.container
		}).then(() => {
      // console.info(`here`, this);
      this.container.setAttribute(`style`, this.playerStyles.responsiveContainerStyle);
      this.frame && this.frame.contentWindow && this.frame.contentWindow.postMessage(JSON.stringify({
        msg: `play_video`
      }), `*`);
      //this.frame.addEventListener('mouseover', alert('yo'), true);
      //this.frame.addEventListener('mouseout', alert('oy'), true);
    });
    this.playerSettings.playerInstantiated = true;
  }

  setUpPlayer() {
    this.log.info(`setUpPlayer`);
    this.frame.setAttribute(`frameborder`, `0`);
    this.frame.setAttribute(`referrer-policy`, `unsafe-url`);
    this.frame.setAttribute(`allow`, `autoplay;fullscreen`);
    this.frame.setAttribute(`style`, `height:0px;width:0px;height 0.75s ease-in;`);

    this.log.info(`initMoovlah setting frame`, this.frame);

    const frameSrc = this.constructIframeSrc({});

    this.frame.setAttribute(`src`, frameSrc);
    this.frame.onload = this.onFrameLoaded.bind(this);
    const placementWidth = this.container.offsetWidth;
    this.log.info(`width`, placementWidth, `height`, (placementWidth * (9/16)));
    this.frame.setAttribute(`style`, `height:100%;width:100%;`);
    this.frameHolder.setAttribute(`style`, this.playerStyles.responsiveFrameStyle);
    this.playerComponent.setAttribute(`style`, `height:100%;width:100%`);
    this.playerComponent.setAttribute(`configuration-key`, this.playerSettings.configurationKey);
    this.frameHolder.appendChild(this.frame);
    // this.frameHolder.appendChild(this.playerComponent);
    this.container.prepend(this.frameHolder);

    return;
    // this.container.remove(this.placeHolder)
  }

  beginIntersectionObserver() {
    this.log.info(`beginIntersectionObserver`);
    this.intersectionObserver = new IntersectionObserver(entries => {
        // If the browser is busy while scrolling happens, multiple entries can
        // accumulate between invocations of this callback. As long as any one
        // of the notifications reports the sentinel within the scrolling viewport,
        // we add more content.
        //this.log.info(`intersectionObserver`, entries);
        entries.forEach(entry => {
          //this.log.info(`intersectionObserver`, entry);
          if(entry.intersectionRatio < 0.5) {
            //this.log.info(`intersectionObserver not in viewport`, entry);
            if(this.playerSettings.playerLoaded) {
              this.onPlayerExitViewport();
            }
          }
          else {
            this.log.info(`intersectionObserver in viewport`, this.playerSettings.firstVisible, this.frameLoaded, this.playerSettings.playerInstantiated);
            if(!this.playerSettings.firstVisible && this.playerSettings.frameLoaded && !this.playerSettings.playerInstantiated) {
              this.playerSettings.firstVisible = true;
              this.initPlayer();
            }
            if(this.playerSettings.playerLoaded) {
              this.onPlayerEnterViewport();
            }
          }
        });
      }, this.intersectionSettings);
    this.intersectionObserver.observe(this.container);
  }

};
