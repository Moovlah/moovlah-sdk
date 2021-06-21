import videojs from 'video.js';
import loglevel from 'loglevel';

export default class videoJSPlayer {

  constructor(opts) {

    if(window.addEventListener) {
      window.addEventListener(`message`, this.handlePostMessage.bind(this),false);
    } else {
      window.attachEvent(`onmessage`, this.handlePostMessage.bind(this),false);
    }

  }

  handlePostMessage(msg) {

  }



}
