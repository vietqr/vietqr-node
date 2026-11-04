// One-time deprecation notices: upgrading must keep old code running and only print a warning.
const seen = new Set();

function warnOnce(key, message) {
    if (seen.has(key)) return;
    seen.add(key);
    console.warn(`[vietqr] ${message}`);
}

module.exports = { warnOnce };
