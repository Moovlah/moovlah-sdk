import { UASnippet, GtagSnippet } from './ga_loader';
import log from 'loglevel';

export default class MoovlahTracker {
  constructor(opts) {
    this.loglevel = `warn`;

    if(opts.loglevel) {
      this.loglevel = opts.loglevel;
    }

    log.setDefaultLevel(this.loglevel);

    this.trackers = {
      'google_analytics': {
        ids: ['UA-172822330-1']
      },
      'gtag': {
        ids: []
      },
    };
    this.dimensionsMap = {
      google_analytics: [
        ``, //GOOGLE STARTS COUNTING AT 1
        `player_id`,
        `content_id`,
        `floating`,
        `placement_id`,
        `distribution_id`,
        `user_id`,
        `player_type`,
        `embedtype`,
        `mute`,
        `universal_ad_id`,
        `play_id`,
        `universal_ad_id_registry`,
        `error_code`,
        `error_message`,
        `placement_domain`,
        `ad_network_id`,
        `ad_unit_id`,
        `ad_id`,
        `ad_query_id`
      ]
    };
    this.metricsMap = {
      google_analytics: [
        ``, //GOOGLE STARTS COUNTING AT 1
      ]
    };
    this.variablesMap = {
      google_analytics: [
        ``, //GOOGLE STARTS COUNTING AT 1
      ]
    };
    this.dimensions = opts.dimensions || {};
    this.metrics = opts.metrics || {};
    this.variables = opts.variables || {};
    this.player = opts.player;

    log.debug('MoovlahTracker', opts, this.dimensions);

    for(let tracker in opts.trackers) {

      opts.trackers[tracker] = Array.isArray(opts.trackers[tracker]) ? opts.trackers[tracker] : [ opts.trackers[tracker] ];
      if(this.trackers[tracker]) {
          opts.trackers[tracker].map((i) => {
          this.trackers[tracker].ids.push(i);
        });
      } else {
        this.trackers[tracker] = {
          ids: opts.trackers[tracker]
        };
      }
    }

    for(let tracker in this.trackers) {
      if(!this.trackers[tracker] || !this.trackers[tracker].ids){
        log.info('empty tracker so skipping', tracker);
        continue;
      }
      if(this.trackers[tracker].ids.length === 0) {
        log.info('empty tracker array so skipping', tracker);
        continue;
      } else {
        log.info('have tracker ' + tracker , this.trackers[tracker].ids.length);
      }
      switch(tracker) {
        case 'gtag':
          GtagSnippet(tracker.ids)
          .then((c) => {
            log.debug('loading gtag', c);
            this._gtag = c;
            this.trackers[tracker].tracker = this._gtag;
          })
          .catch((err) => {
            log.error('Error loading GA', err);
          })
        case 'google_analytics':
          UASnippet()
          .then((c) => {
            log.debug('loading ua', c);
            this.trackers[tracker].tracker = this._ga;
            log.debug('loaded', this.trackers[tracker].tracker, this.trackers[tracker].ids);
            this.trackers[tracker].tracker('create', this.trackers[tracker].ids[0], `Moovlah_${tracker}`, {
              storage: 'none'
            });
            /**
            ALWAYS DO THIS BC EXTRA TRACKERS NOT ADDED UNTIL AFTER CONFIG LOADED
            if(this.trackers[tracker].ids.length > 1) {
            */
              log.debug('wiring up broadcast function');
              this.trackers[tracker].tracker(this.broadcastGoogleAnalytics.bind(this));
            /**
            }
            */

            this.trackers[tracker].tracker('send', 'pageview', this._gaDimensions);
          })
          .catch((err) => {
            log.error('Error loading GA', err);
          })
          break;
      }
    }
  }

  broadcastGoogleAnalytics(tracker) {
    log.debug('broadcastGoogleAnalytics', tracker);
    this.trackers['google_analytics'].originalSendHitTask = tracker.get('sendHitTask');
    tracker.set('sendHitTask', this.customGaSendHitTask.bind(this));
  }

  customGaSendHitTask(model) {
    log.info('running original send hit task', this.trackers['google_analytics'].ids.length);
    this.trackers['google_analytics'].originalSendHitTask(model);
    for(let i=1; i < this.trackers['google_analytics'].ids.length;i++) {
      log.info('duplicate sendHitTask duplicate tracking', this.trackers['google_analytics'].ids[i]);
      const hitPayload = model.get('hitPayload');
      const trackingId = new RegExp(model.get('trackingId'), 'gi');
      log.info('duplicate sendHitTask duplicate tracking original prop', trackingId);
      model.set('hitPayload', hitPayload.replace(trackingId, this.trackers['google_analytics'].ids[i]), true);
      this.trackers['google_analytics'].originalSendHitTask(model);
    }
  }

  get _ga() {
    return window[window.GoogleAnalyticsObject]
  }

  get _gaDimensions() {
    let dims = {};
    for(let i = 1; i < this.dimensionsMap.google_analytics.length; i++) {
      //default to `0` so reports don't omit rows on empty data
      log.info(`dim`, this.dimensions, i)
      dims[`dimension${i}`] = this.dimensions[this.dimensionsMap.google_analytics[i]] || `0`
      dims[`dimension${i}`] = dims[`dimension${i}`].toString()
    }
    log.info('dims', dims);
    return dims;
  }

  updateDimensions(dimensions) {
    for(let dim in dimensions) {
      this.dimensions[dim] = `${dimensions[dim]}`
      /**
      const dimidx = this.dimensionsMap.google_analytics.indexOf(dim)
      if(dimidx > 0) {
        this.dimensions[`dimension${dimidx}`] = dimensions[dim]
      } else {
        console.warn(`No dimension index found for ${dim}`, this.dimensionsMap.google_analytics)
      }
      */
    }
  }

  updateMetrics(metrics) {
    log.info(`updateMetrics`, metrics);
    for(let met in metrics) {
      const metricidx = this.metricMap.google_analytics[met];
      this.dimensions[`metric${metricidx}`] = metrics[metricidx];
    }
  }

  addTracker(trackers) {
    log.info(`addTracker`, trackers);
    for(let tracker in trackers) {
      trackers[tracker] = Array.isArray(trackers[tracker]) ? trackers[tracker] : [ trackers[tracker] ];
      log.info(`addTracker adding tracker`, trackers[tracker]);
      if(this.trackers[tracker]) {
          trackers[tracker].map((i) => {
          this.trackers[tracker].ids.push(i);
        });
      } else {
        this.trackers[tracker] = {
          ids: trackers[tracker]
        };
      }
    }
  }

  updateVariables(vars) {
    log.info(`addTracker`, vars);
    for(let v in vars) {
      const metricidx = this.variableMap.google_analytics[v];
      if(metricidx) {
        this.variables[metricidx] = vars[v];
      }
    }
  }

  trackEvent(obj) {
    obj = {...obj,...this._gaDimensions};
    for(let tracker in this.trackers) {
      if(!this.trackers[tracker] || !this.trackers[tracker].ids){
        log.info('empty tracker so skipping', tracker);
        continue;
      }
      if(this.trackers[tracker].ids.length === 0) {
        log.info('empty tracker array so skipping', tracker);
        continue;
      } else {
        log.info('have tracker ' + tracker , this.trackers[tracker].ids.length);
      }
      switch(tracker) {
        case 'google_analytics':
          log.info('ga tracker', this.trackers[tracker]);
          if (this.trackers[tracker]._gaBeacon) {
            obj.transport = 'beacon';
            this.trackers[tracker]._gaBeacon = false;
          }
          this._ga(`send`, `event`, obj);
          break;
        case 'gtag':
          log.info('gtag tracker', this.trackers[tracker]);
          const dims = this._gaDimensions;
          dims.event_category = obj.eventCategory;
          dims.event_value = obj.eventValue;
          dims.event_label = obj.eventLabel;
          this._gtag('event', obj.eventAction, dims);
      }
    }
  }

}
