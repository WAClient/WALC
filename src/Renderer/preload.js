// FIXME: workaround for this issue https://github.com/signalapp/libsignal-protocol-javascript/issues/6#issuecomment-247208665
window.nodeRequire = require;
delete window.require;
setTimeout(() => {
	window.require = window.nodeRequire;
	delete window.nodeRequire;
	require('./App');
}, 3000);
