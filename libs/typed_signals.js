"use strict";
window.typedSignals = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // Collector.js
  var require_Collector = __commonJS({
    "Collector.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Collector = void 0;
      var Collector = class {
        /**
         * Create a new collector.
         *
         * @param signal The signal to emit.
         */
        constructor(signal) {
          this.emit = (...args) => {
            signal["emitCollecting"](this, args);
          };
        }
      };
      exports.Collector = Collector;
    }
  });

  // CollectorArray.js
  var require_CollectorArray = __commonJS({
    "CollectorArray.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.CollectorArray = void 0;
      var Collector_1 = require_Collector();
      var CollectorArray = class extends Collector_1.Collector {
        constructor() {
          super(...arguments);
          this.result = [];
        }
        handleResult(result) {
          this.result.push(result);
          return true;
        }
        /**
         * Get the list of results from the signal handlers.
         */
        getResult() {
          return this.result;
        }
        /**
         * Reset the result
         */
        reset() {
          this.result.length = 0;
        }
      };
      exports.CollectorArray = CollectorArray;
    }
  });

  // CollectorLast.js
  var require_CollectorLast = __commonJS({
    "CollectorLast.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.CollectorLast = void 0;
      var Collector_1 = require_Collector();
      var CollectorLast = class extends Collector_1.Collector {
        handleResult(result) {
          this.result = result;
          return true;
        }
        /**
         * Get the result of the last signal handler.
         */
        getResult() {
          return this.result;
        }
        /**
         * Reset the result
         */
        reset() {
          delete this.result;
        }
      };
      exports.CollectorLast = CollectorLast;
    }
  });

  // CollectorUntil0.js
  var require_CollectorUntil0 = __commonJS({
    "CollectorUntil0.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.CollectorUntil0 = void 0;
      var Collector_1 = require_Collector();
      var CollectorUntil0 = class extends Collector_1.Collector {
        constructor() {
          super(...arguments);
          this.result = false;
        }
        handleResult(result) {
          this.result = result;
          return this.result;
        }
        /**
         * Get the result of the last signal handler.
         */
        getResult() {
          return this.result;
        }
        /**
         * Reset the result
         */
        reset() {
          this.result = false;
        }
      };
      exports.CollectorUntil0 = CollectorUntil0;
    }
  });

  // CollectorWhile0.js
  var require_CollectorWhile0 = __commonJS({
    "CollectorWhile0.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.CollectorWhile0 = void 0;
      var Collector_1 = require_Collector();
      var CollectorWhile0 = class extends Collector_1.Collector {
        constructor() {
          super(...arguments);
          this.result = false;
        }
        handleResult(result) {
          this.result = result;
          return !this.result;
        }
        /**
         * Get the result of the last signal handler.
         */
        getResult() {
          return this.result;
        }
        /**
         * Reset the result
         */
        reset() {
          this.result = false;
        }
      };
      exports.CollectorWhile0 = CollectorWhile0;
    }
  });

  // SignalConnection.js
  var require_SignalConnection = __commonJS({
    "SignalConnection.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.SignalConnectionImpl = void 0;
      var SignalConnectionImpl = class {
        /**
         * @param link The actual link of the connection.
         */
        constructor(link) {
          this.link = link;
        }
        disconnect() {
          return this.link.unlink();
        }
        set enabled(enable) {
          this.link.setEnabled(enable);
        }
        get enabled() {
          return this.link.isEnabled();
        }
      };
      exports.SignalConnectionImpl = SignalConnectionImpl;
    }
  });

  // SignalLink.js
  var require_SignalLink = __commonJS({
    "SignalLink.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.SignalLink = void 0;
      var SignalLink = class _SignalLink {
        constructor(prev, next, options) {
          this.enabled = true;
          this.newLink = false;
          this.prev = prev !== null && prev !== void 0 ? prev : this;
          this.next = next !== null && next !== void 0 ? next : this;
          this.order = options.order;
          this.isPublic = options.isPublic;
          this.callback = options.callback;
          this.onUnlink = options.onUnlink;
        }
        isEnabled() {
          return this.enabled && !this.newLink;
        }
        setEnabled(flag) {
          this.enabled = flag;
        }
        unlink() {
          if (this.callback) {
            delete this.callback;
            this.next.prev = this.prev;
            this.prev.next = this.next;
            this.onUnlink();
            return true;
          }
          return false;
        }
        insert(options) {
          const { order } = options;
          let after = this.prev;
          while (after !== this) {
            if (after.order <= order)
              break;
            after = after.prev;
          }
          const link = new _SignalLink(after, after.next, options);
          after.next = link;
          link.next.prev = link;
          return link;
        }
      };
      exports.SignalLink = SignalLink;
    }
  });

  // Signal.js
  var require_Signal = __commonJS({
    "Signal.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Signal = void 0;
      var SignalConnection_1 = require_SignalConnection();
      var SignalLink_1 = require_SignalLink();
      var headOptions = { order: 0, isPublic: true, onUnlink() {
      } };
      var Signal = class {
        constructor() {
          this.head = new SignalLink_1.SignalLink(null, null, headOptions);
          this.hasNewLinks = false;
          this.emitDepth = 0;
          this.connectionsCount = 0;
          this.onUnlink = () => {
            this.connectionsCount--;
          };
        }
        /**
         * @returns The number of connections on this signal.
         */
        getConnectionsCount() {
          return this.connectionsCount;
        }
        /**
         * @returns true if this signal has connections.
         */
        hasConnections() {
          return this.connectionsCount > 0;
        }
        /**
         * Subscribe to this signal.
         *
         * @param callback This callback will be run when emit() is called.
         * @param options Configure options for the connection
         */
        connect(callback, { order = 0, isPublic = true } = {}) {
          this.connectionsCount++;
          const link = this.head.insert({ callback, order, isPublic, onUnlink: this.onUnlink });
          if (this.emitDepth > 0) {
            this.hasNewLinks = true;
            link.newLink = true;
          }
          return new SignalConnection_1.SignalConnectionImpl(link);
        }
        /**
         * Unsubscribe from this signal with the original callback instance.
         * While you can use this method, the SignalConnection returned by connect() will not be updated!
         *
         * @param callback The callback you passed to connect().
         */
        disconnect(callback) {
          for (let link = this.head.next; link !== this.head; link = link.next) {
            if (link.callback === callback) {
              link.unlink();
              return true;
            }
          }
          return false;
        }
        /**
         * Disconnect all handlers from this signal event.
         */
        disconnectAll() {
          let { next } = this.head;
          while (next !== this.head) {
            if (next.isPublic) {
              next.unlink();
            }
            next = next.next;
          }
        }
        /**
         * Publish this signal event (call all handlers).
         */
        emit(...args) {
          this.emitDepth++;
          for (let link = this.head.next; link !== this.head; link = link.next) {
            if (link.isEnabled() && link.callback)
              link.callback.apply(null, args);
          }
          this.emitDepth--;
          this.unsetNewLink();
        }
        emitCollecting(collector, args) {
          this.emitDepth++;
          for (let link = this.head.next; link !== this.head; link = link.next) {
            if (link.isEnabled() && link.callback) {
              const result = link.callback.apply(null, args);
              if (!collector.handleResult(result))
                break;
            }
          }
          this.emitDepth--;
          this.unsetNewLink();
        }
        unsetNewLink() {
          if (this.hasNewLinks && this.emitDepth === 0) {
            for (let link = this.head.next; link !== this.head; link = link.next)
              link.newLink = false;
            this.hasNewLinks = false;
          }
        }
      };
      exports.Signal = Signal;
    }
  });

  // SignalConnections.js
  var require_SignalConnections = __commonJS({
    "SignalConnections.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.SignalConnections = void 0;
      var SignalConnections = class {
        constructor() {
          this.list = [];
        }
        /**
         * Add a connection to the list.
         * @param connection
         */
        add(connection) {
          this.list.push(connection);
        }
        /**
         * Disconnect all connections in the list and empty the list.
         */
        disconnectAll() {
          for (const connection of this.list) {
            connection.disconnect();
          }
          this.list = [];
        }
        /**
         * @returns The number of connections in this list.
         */
        getCount() {
          return this.list.length;
        }
        /**
         * @returns true if this list is empty.
         */
        isEmpty() {
          return this.list.length === 0;
        }
      };
      exports.SignalConnections = SignalConnections;
    }
  });

  // index.js
  var require_dist = __commonJS({
    "index.js"(exports) {
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.SignalConnections = exports.Signal = exports.CollectorWhile0 = exports.CollectorUntil0 = exports.CollectorLast = exports.CollectorArray = exports.Collector = void 0;
      var Collector_1 = require_Collector();
      Object.defineProperty(exports, "Collector", { enumerable: true, get: function() {
        return Collector_1.Collector;
      } });
      var CollectorArray_1 = require_CollectorArray();
      Object.defineProperty(exports, "CollectorArray", { enumerable: true, get: function() {
        return CollectorArray_1.CollectorArray;
      } });
      var CollectorLast_1 = require_CollectorLast();
      Object.defineProperty(exports, "CollectorLast", { enumerable: true, get: function() {
        return CollectorLast_1.CollectorLast;
      } });
      var CollectorUntil0_1 = require_CollectorUntil0();
      Object.defineProperty(exports, "CollectorUntil0", { enumerable: true, get: function() {
        return CollectorUntil0_1.CollectorUntil0;
      } });
      var CollectorWhile0_1 = require_CollectorWhile0();
      Object.defineProperty(exports, "CollectorWhile0", { enumerable: true, get: function() {
        return CollectorWhile0_1.CollectorWhile0;
      } });
      var Signal_1 = require_Signal();
      Object.defineProperty(exports, "Signal", { enumerable: true, get: function() {
        return Signal_1.Signal;
      } });
      var SignalConnections_1 = require_SignalConnections();
      Object.defineProperty(exports, "SignalConnections", { enumerable: true, get: function() {
        return SignalConnections_1.SignalConnections;
      } });
    }
  });
  return require_dist();
})();
