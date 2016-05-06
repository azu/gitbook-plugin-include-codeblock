// LICENSE : MIT
/*
 * Gibook usage:
 *
 *      [import,title](path/to/file)
 *      [import,title:<the title>](path/to/file)
 */

const spaces = "[ \t]*"; // h spaces
const titleFormat = "([^'\"]*)?";

/*
 * format: [import,title:<the title>](path/to/file)
 * Get the specified <the title>
 * @example:
 *     parseTitle(label,fileName)
 * @param {string} label
 * @param {string} fileName
 *
 * @return {boolean,string}
 */
export function parseTitle(label, fileName) {
    let title=[false, undefined];
    const regstr2 = "\^.*,?" + spaces + "title"+ spaces
        + ":"+ spaces +"[\"']" + titleFormat + "[\"']" + spaces
        + ",?.*\$";
    const reg2 = new RegExp(regstr2);
    const res2 = label.match(reg2);

    if( res2 ) {
        title=[true, res2[1]];
    }
    else {
        const regstr1 = "\^.*,?" + spaces + "title"+ spaces + ",?.*\$";
        const reg1 = new RegExp(regstr1);
        const res1 = label.match(reg1);
        if( res1 ) {
            title=[true, fileName];
        }
    }
    return title;
}

