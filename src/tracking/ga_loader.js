// Based on Google Analytics JavaScript Tracking Snippet
// See original @ https://developers.google.com/analytics/devguides/collection/analyticsjs/tracking-snippet-reference
import log from 'loglevel';
/**
 * Creates a temporary global ga object and lazy loads analytics.js.
 * @function
 * @param {string} Global name of analytics object. Defaults to 'ga'.
 * @param {boolean} Set to true to load the debug version of the analytics.js library.
 * @param {boolean} Set to true to enable trace debugging.
 */

log.setDefaultLevel('debug');

const UASnippet = function(name='ga', debug=false, trace=false) {
  // Preserve renaming support and minification
  return new Promise(function(resolve, reject) {
    let win = window, doc = document, el = 'script';
    // Acts as a pointer to support renaming
    win.GoogleAnalyticsObject || (win.GoogleAnalyticsObject = name);

    // Ensure analytics.js is not already loaded
    if (win[name] && (typeof win[name] === 'function')) {
      resolve(win.GoogleAnalyticsObject);
    }

    if (trace) {
      win['ga_debug'] = {trace: true};
    }

    // Creates an initial ga() function
    // The queued commands will be executed once analytics.js loads
    win[name] = function() {
      win[name].q.push(arguments);
    };
    win[name].q = [];

    // Sets the time (as an integer) this tag was executed
    // Used for timing hits
    win[name].l = 1 * new Date();

    // Insert script element above the first script element in document
    // (async + https)
    let first = doc.getElementsByTagName(el)[0];
    let script = doc.createElement(el);
    script.src = 'https://www.google-analytics.com/analytics' + (debug ? '_debug.js' : '.js');
    script.async = true;
    //if (typeof cb === 'function') script.onload = () => { onLoad(true); }
    script.onload = resolve(win.GoogleAnalyticsObject);
    script.onerror = reject('error loading GA');
    first.parentNode.insertBefore(script, first);
  });
}

const GtagSnippet = function(MEASUREMENT_ID) {
  // Preserve renaming support and minification
  log.info(`GtagSnippet`, MEASUREMENT_ID);
  MEASUREMENT_ID = Array.isArray(MEASUREMENT_ID) ? MEASUREMENT_ID : [ MEASUREMENT_ID ];
  log.info(`GtagSnippet Array`, MEASUREMENT_ID);
  return new Promise(function(resolve, reject) {
    // Insert script element above the first script element in document
    // (async + https)
    let win = window, doc = document, el = 'script';
    let first = doc.getElementsByTagName(el)[0];
    let script = doc.createElement(el);
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID[0]}`;
    script.async = true;
    //if (typeof cb === 'function') script.onload = () => { onLoad(true); }
    script.onload = ((e) => {
      log.debug(`gTag onLoad`, e);
      win.dataLayer = win.dataLayer || [];
      function gtag(){
        log.debug('gtag', arguments);
        win.dataLayer.push(arguments);
      }
      gtag('js', new Date());
      MEASUREMENT_ID.map((i) => {
        log.info(`configuring gtag id`, i)
        gtag('config', i);
      });
      resolve(gtag);
    });
    script.onerror = ((err) => {
      console.error(err);
      reject(err);
    });
    first.parentNode.insertBefore(script, first);
  });
}

export {
  UASnippet,
  GtagSnippet
}
