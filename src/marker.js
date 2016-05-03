// LICENSE : MIT

/*
 * format: [import:<markername>](path/to/file)
 * marker name start with alpha [a-Z] char.
 *
 * Example:
 *
 * [import:markname, hello-world.js](../src/hello-world.js)
 */
export function getMarkerName(label) {
    var reg = /^(?:include|import):?([a-zA-z]\w*)[,\s]?.*$/;
    var res = reg.exec(label);

    // return ['', ''] if not matched.
    return res ? res.slice(1) : '';
}

/*
 * format: [import:<markername>](path/to/file)
 * check if the import filled has a markername.
 * Example:
 *      hasMarker(getMarkerName(label))
 */
export function hasMarker(label) {
    return ( label === '' ) ? false:true;
}
