import log from 'loglevel';

const camelize = (myString) => {
  return myString.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
};

const uncamelize = (myString) => {
  return myString.replace(/[A-Z]/g, '-$&').toLowerCase();
};

const serializeParams = (obj, prefix) => {
  let str = [],
    p;
  for (p in obj) {
    if (obj.hasOwnProperty(p)) {
      const k = prefix ? prefix + `[${p}]` : p,
        v = obj[p];
      str.push((v !== null && typeof v === `object`) ?
        serialize(v, k) :
        encodeURIComponent(k) + `=` + encodeURIComponent(v));
    }
  }
  return str.join(`&`);
};

export default class MoovlahPlayer {

  intersectionSettings = {
    threshold: [0, 0.2],
    rootMargin: `0px 0px 0px 0px`
  };

  playerSettings = {
    embedTag: null,
    placement: ``
  };

  logSettings = {
    logLevel: `debug`
  };

  scriptTag = null;

  intersectionObserver = null;
  messageBus = null;

  firstVisible = false;

  log = log;

  playerStyles = {
    responsiveContainerStyle: `position: relative;padding-bottom: 56.25%;height: 0;overflow: hidden;text-align:center;`,
    responsiveFrameStyle: `position: absolute;top: 0;left: 0;width: 100%;height: 100%;`,
    floatingFrameStyle: `box-shadow: 0 3px 4px 0 rgba(0,0,0,0.14), 0 3px 3px -2px rgba(0,0,0,0.12), 0 1px 8px 0 rgba(0,0,0,0.20); position: fixed; right: 20px; bottom: 20px; top: auto; left: auto; max-width: 280px; max-height: 158px; width: 280px; height: 158px;`,
    floatingFrameStyleBottomLeft: `left: 20px; right: auto; bottom: 20px; top: auto;`,
    floatingFrameStyleBottomRight: `right: 20px; left: auto; bottom: 20px; top: auto;`,
    floatingFrameStyleTopLeft: `left: 20px; right: auto; top: 20px; bottom: auto;`,
    floatingFrameStyleTopRight: `right: 20px; left: auto; top: 20px; bottom: auto;`,
    floatingFrameStyleMiddleLeft: `left: 20px; right: auto; bottom: 50%; top: auto;`,
    floatingFrameStyleMiddleRight: `right: 20px; left: auto; bottom: 50%; top: auto;`,
    closeButton: `position: absolute; display: block; right: 5px; bottom: auto; top: 5px; left: auto; cursor: pointer; fill: rgba(0,0,0,1); height: 24px; width: 24px;`
  };

  allowableParams = [
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

  constructor(opts) {

    foreach(let section in opts) {
      foreach(let setting in opts[section]) {
        if(this[section].hasOwnProperty(setting)) {
          this[section][setting] = opts[section][setting];
        }
      }
    }

    if(window.addEventListener) {
      window.addEventListener(`message`, this.handlePostMessage,false);
    } else {
      window.attachEvent(`onmessage`, this.handlePostMessage,false);
    }

    this.log.setDefaultLevel(this.logSettings.logLevel);
    this.log.warn(`logger at level`, this.logSettings.logLevel);

    this.scriptTag = document.currentScript || (function() {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

    this.getConfiguration();
    this.initPlayer();

    this.log.debug(`have config`, this.playerSettings.placement);

  }

  this.createPlayerElements() {
    this.container = document.createElement(`div`);
    this.frameHolder = document.createElement(`div`);
    this.container.appendChild(frameHolder);
    this.frame = document.createElement(`iframe`);
    this.closeBtn = document.createElement(`img`);
    this.closeBtn.setAttribute(`src`, `https://p.moovlah.io/img/close-button-light-grey.png`);
    this.closeBtn.setAttribute(`style`, appStyles.closeButton);
    this.closeBtn.onclick = (e) => {
      if(this.intersectionObserver) {
        this.frameHolder.style = this.playerStyles.responsiveFrameStyle;
        this.frameHolder.removeChild(closeBtn);
        this.intersectionObserver.disconnect();
      }
    };
  }

  getConfiguration() {
    this.log.debug(`getConfiguration`, this.playerSettings);

    if(this.playerSettings.placement) {
      try {
        if(typeof this.playerSettings.placement === `string`) {
          this.playerSettings.placement = JSON.parse(atob(this.playerSettings.placement));
        }
        return true;
      } catch(e) {
        this.log.error(`Error parsing passed-in config`, e);
      }
    } else {
      return this.placementFromConfigKey();
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

  placementFromConfigKey() {

  }

  showPosterPlaceholder() {
    this.log.info(`showPosterPlaceholder`, this.playerSettings.playlist);
  }

  activateStickiness() => {
    this.log.info(`activateStickiness`);
    this.intersectionObserver = new IntersectionObserver(entries => {
        // If the browser is busy while scrolling happens, multiple entries can
        // accumulate between invocations of this callback. As long as any one
        // of the notifications reports the sentinel within the scrolling viewport,
        // we add more content.
        this.log.info(`intersectionObserver`, entries);
        if (entries.some(entry => entry.intersectionRatio > 0)) {
          this.log.info(`player in viewport`);
          this.frame.contentWindow.postMessage(JSON.stringify({
            msg: `player_entered_viewport`
          }), `*`);
          this.frameHolder.style = this.playerStyles.responsiveFrameStyle;
          this.frameHolder.removeChild(this.closeBtn);
        } else {
          this.log.info(`player out of viewport`);
          this.frame.contentWindow.postMessage(JSON.stringify({
            msg: `player_exited_viewport`
          }), `*`);
          const  qStyle = this.playerSettings.placement.anchorCorner ? this.playerSettings.placement.anchorCorner.split(`-`).map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(``) : ``;
          const quadrantStyle = `floatingFrameStyle${qStyle}`;
          this.log.info(`quadrantStyle`, quadrantStyle);
          const fStyle = `${this.playerStyles.floatingFrameStyle}${this.playerStyles[quadrantStyle]}`;
          this.log.info(`fStyle`, fStyle);
          this.frameHolder.appendChild(closeBtn);
          this.frameHolder.style = fStyle;
        }
      });
    this.intersectionObserver.observe(this.container);
  }



};
