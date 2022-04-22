const EventEmitter = require('events');
const { sessionBus: SessionBus, Variant } = require('dbus-next');

let externalSessionBus;
let selfSessionBus;
let Notifications;
let getInterfaceStat = false;
let supportsInlineReply;
const notificationCounter = [];

const Config = {
  autoDisconnectSessionBus: true,
};

const notifierEmitter = new EventEmitter();

const disconnectSessionBus = function disconnectSessionBus() {
  if (!selfSessionBus) {
    return;
  }
  // Save it for delayed disconnection.
  const sessionBus = selfSessionBus;
  selfSessionBus = undefined;
  // dbus-next bug
  // disconnecting the dbus connection immediately will throw an error, so let's delay the disconnection just in case.
  setTimeout(() => {
    sessionBus.disconnect();
  }, 100);
};

const actionInvoked = function actionInvoked(id, actionKey) {
  notifierEmitter.emit(`ActionInvoked:${id}`, actionKey);
};

const notificationClosed = function notificationClosed(id, reason) {
  notifierEmitter.emit(`NotificationClosed:${id}`, reason);
};

const notificationReplied = function notificationReplied(id, reply) {
  notifierEmitter.emit(`NotificationReplied:${id}`, reply);
};

const bindNotifications = function bindNotifications(notificationInterface) {
  // Since the NotificationClosed event will fire when any notification is closed
  // using ID to trigger the event here allows us to use once() elsewhere without binding too many events.
  notificationInterface.on('ActionInvoked', actionInvoked);
  notificationInterface.on('NotificationClosed', notificationClosed);
  Notify.supportsInlineReply().then((supported) => {
    if(supported) {
      notificationInterface.on('NotificationReplied', notificationReplied);
    }
  });
  Notifications = notificationInterface;
  return Notifications;
};

const unsetNotifications = function unsetNotifications() {
  if (!Notifications) {
    return;
  }
  Notifications.off('ActionInvoked', actionInvoked);
  Notifications.off('NotificationClosed', notificationClosed);
  Notifications.off('NotificationReplied', notificationReplied);
  Notifications = undefined;
};

const getSessionBus = function getSessionBus() {
  if (externalSessionBus) {
    return externalSessionBus;
  }
  if (!selfSessionBus) {
    selfSessionBus = SessionBus();
  }
  return selfSessionBus;
};

const setSessionBus = function setSessionBus(sessionBus) {
  unsetNotifications();
  disconnectSessionBus();
  externalSessionBus = sessionBus;
  Config.autoDisconnectSessionBus = Config.autoDisconnectSessionBus && !sessionBus;
};

const getInterface = function getInterface() {
  if (Notifications) {
    return Promise.resolve(Notifications);
  }
  if (getInterfaceStat) {
    return new Promise((resolve, reject) => {
      notifierEmitter.once('getInterface', resolve);
      notifierEmitter.once('getInterfaceError', reject);
    });
  }
  getInterfaceStat = true;
  return new Promise((reslove, reject) => {
    getSessionBus().getProxyObject('org.freedesktop.Notifications', '/org/freedesktop/Notifications')
      .then((obj) => {
        const i = bindNotifications(obj.getInterface('org.freedesktop.Notifications'));
        notifierEmitter.emit('getInterface', i);
        reslove(i);
      })
      .catch((err) => {
        if (Config.autoDisconnectSessionBus) {
          disconnectSessionBus();
        }
        notifierEmitter.emit('getInterfaceError', err);
        reject(err);
      })
      .finally(() => {
        getInterfaceStat = false;
      });
  });
};

const setInterface = function setInterface(notificationInterface) {
  unsetNotifications();
  disconnectSessionBus();
  if (notificationInterface) {
    bindNotifications(notificationInterface);
  } else {
    // Get a new one to continue processing old events.
    getInterface();
  }
};

const genIdentifier = function* genIdentifier() {
  let IX = 0;
  while (true) {
    IX = IX >= 25 ? 0 : IX + 1;
    const ide = String.fromCharCode(64 + IX);
    yield ide;
  }
};
const identifier = genIdentifier();

notifierEmitter.on('push', () => {
  notificationCounter.push(true);
});

notifierEmitter.on('pop', () => {
  notificationCounter.pop();
  if (Config.autoDisconnectSessionBus && selfSessionBus && notificationCounter.length === 0) {
    unsetNotifications();
    disconnectSessionBus();
  }
});

const actionInvokedSymbol = Symbol('actionInvoked');

class Notify extends EventEmitter {
  #id = 0;

  #status = 0;

  #actionCallbacks = new Map();

  #config = {};

  [actionInvokedSymbol](actionKey) {
    const callback = this.#actionCallbacks.get(actionKey);
    if (callback) {
      callback();
    }
  }

  static supportsInlineReply() {
    return new Promise((resolve, reject) => {
      if(typeof supportsInlineReply !== 'undefined') {
        return resolve(supportsInlineReply);
      }
      getInterface()
        .then((i) => {
          i.GetCapabilities()
            .then((capabilities) => {
              supportsInlineReply = capabilities.includes('inline-reply');
              resolve(supportsInlineReply);
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }

  get id() {
    return this.#id;
  }

  get status() {
    return this.#status;
  }

  constructor(config) {
    super();
    this.#config = {
      appName: config.appName || '',
      replacesId: config.replacesId || 0,
      appIcon: config.appIcon || '',
      summary: config.summary || '',
      body: config.body || '',
      actions: [],
      hints: {},
      timeout: config.timeout || 0,
    };
    const hints = config.hints || {};
    if (typeof hints.actionIcons === 'boolean') {
      this.#config.hints['action-icons'] = new Variant('b', hints.actionIcons);
    }
    if (typeof hints.category === 'string') {
      // eslint-disable-next-line dot-notation
      this.#config.hints['category'] = new Variant('s', hints.category);
    }
    if (typeof hints.desktopEntry === 'string') {
      this.#config.hints['desktop-entry'] = new Variant('s', hints.desktopEntry);
    }
    if (typeof hints.imagePath === 'string') {
      this.#config.hints['image-path'] = new Variant('s', hints.imagePath);
    }
    if (typeof hints.imageData === 'object' && hints.imageData) {
      const channel = (hints.imageData.hasAlpha ? 4 : 3);
      this.#config.hints['image-data'] = new Variant('(iiibiiay)', [
        hints.imageData.width,
        hints.imageData.height,
        hints.imageData.width * channel,
        hints.imageData.hasAlpha,
        8,
        channel,
        hints.imageData.data,
      ]);
    }
    if (typeof hints.resident === 'boolean') {
      // eslint-disable-next-line dot-notation
      this.#config.hints['resident'] = new Variant('b', hints.resident);
    }
    if (typeof hints.soundFile === 'string') {
      this.#config.hints['sound-file'] = new Variant('s', hints.soundFile);
    }
    if (typeof hints.soundName === 'string') {
      this.#config.hints['sound-name'] = new Variant('s', hints.soundName);
    }
    if (typeof hints.suppressSound === 'boolean') {
      this.#config.hints['suppress-sound'] = new Variant('b', hints.suppressSound);
    }
    if (typeof hints.transient === 'boolean') {
      // eslint-disable-next-line dot-notation
      this.#config.hints['transient'] = new Variant('b', hints.transient);
    }
    if (typeof hints.x === 'number') {
      // eslint-disable-next-line dot-notation
      this.#config.hints['x'] = new Variant('i', hints.x);
    }
    if (typeof hints.y === 'number') {
      // eslint-disable-next-line dot-notation
      this.#config.hints['y'] = new Variant('i', hints.y);
    }
    if (typeof hints.urgency === 'number') {
      // eslint-disable-next-line dot-notation
      this.#config.hints['urgency'] = new Variant('y', hints.urgency);
    }
  }

  addAction(actionText, callback) {
    const actionKey = `__action_key__::${identifier.next().value}`;
    this.#config.actions.push(actionKey, actionText);
    this.#actionCallbacks.set(actionKey, callback);
    return this;
  }

  addInlineReply(actionText, callback) {
    const actionKey = 'inline-reply';
    this.#config.actions.push(actionKey, actionText);
    this.#actionCallbacks.set(actionKey, callback);
    return this;
  }

  close() {
    if (this.#id !== 0) {
      return getInterface().CloseNotification(this.#id);
    }
    return Promise.resolve();
  }

  removeAction(actionText) {
    const x = this.#config.actions.indexOf(actionText);
    if (x !== -1) {
      this.#config.actions.splice(x - 1, 2);
    }
    return this;
  }

  show() {
    const params = [
      this.#config.appName,
      this.#config.replacesId,
      this.#config.appIcon,
      this.#config.summary,
      this.#config.body,
      this.#config.actions,
      this.#config.hints,
      this.#config.timeout,
    ];
    return new Promise((resolve, reject) => {
      getInterface()
        .then((i) => {
          i.Notify(...params)
            .then((id) => {
              const invoked = this[actionInvokedSymbol].bind(this);
              const replied = (reply) => {
                const callback = this.#actionCallbacks.get('inline-reply');
                if (callback) {
                  callback(reply);
                }
              };

              notifierEmitter.on(`ActionInvoked:${id}`, invoked);
              notifierEmitter.on(`NotificationReplied:${id}`, replied);

              notifierEmitter.once(`NotificationClosed:${id}`, (reason) => {
                this.#status = 2;
                notifierEmitter.off(`ActionInvoked:${id}`, invoked);
                notifierEmitter.off(`NotificationReplied:${id}`, replied);
                notifierEmitter.emit('pop');
                const result = {
                  id,
                  reason,
                };
                this.emit('close', result);
                resolve(result);
              });
              this.#id = id;
              this.#status = 1;
              notifierEmitter.emit('push');
              this.emit('show', id);
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }
}

module.exports = {
  Notify,
  Config,
  disconnectSessionBus,
  getInterface,
  setInterface,
  getSessionBus,
  setSessionBus,
};
