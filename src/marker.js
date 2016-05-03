// LICENSE : MIT
/*
 * Feature: doxygen like snippet code.
 * For code source documenting, see
 * https://www.stack.nl/~dimitri/doxygen/manual/commands.html#cmdsnippet
 *
 * Gibook usage:
 *
 *      [import:<markername>](path/to/file)
 *
 * NB: markername must begin with a letter to avoid conflict with slice
 *     line range.
 */

const commentOpen="(\/+\/+|#|%|\/\\*)";
const commentClose="(\\*\/)?";
const doxChar="[\*!\/]" // doxygen documentation character
const spaces = "[ \t]*"; // h spaces
const spacesAny = "\\s*"; // h+v spaces
const markerNameFormat = "(\\s*[a-zA-Z][\\w\\s]*)"; // Must contain a char.

/*
 * format: [import:<markername>](path/to/file)
 */
export function getMarkerName(label) {
    // regex
    const regstr = "\^(?:include|import):?" + markerNameFormat + "[,\\s]?.*\$"
    const reg = new RegExp(regstr);
    const res = label.match(reg)

    return res ? res[1] : '';
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

/* Parse the code from given markers
 *
 * see test/marker-test.js
 */
export function markersSliceCode( code, markername )
{
    if( hasMarker(markername) ) {
        // regex
        const balise="\\["+ markername +"\\]";
        const pattern= "\\n" + spacesAny + commentOpen + doxChar + spaces + balise
                      + spaces + commentClose + spaces;

        const regstr=pattern+"\\n*([\\s\\S]*)"+pattern;
        const reg = new RegExp(regstr);
        const res = code.match(reg);

        if(res) {
            return res[3]; // count parenthesis in pattern.
        }
        else {
            console.warn('markersSliceCode(): marker `'+markername+'` not found');
            return 'Error: marker `'+ markername +'` not found'
        }
    }
    else {
        return code;
    }
}


// Replace all regex occurence by sub in the string str,
export function replaceAll(str, reg, sub) {
    return str.replace(new RegExp(reg, 'g'), sub);
}

// Function that remove all markers in the given code
export function removeMarkers( code )
{
        // various language comment
        const balise="\\["+ markerNameFormat +"\\]";
        const pattern= spacesAny + commentOpen + doxChar + spaces + balise
            + spaces + commentClose + spaces;

        return replaceAll(code,pattern,'')
}
