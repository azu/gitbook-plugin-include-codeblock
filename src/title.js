// LICENSE : MIT
/*
 * Gibook usage:
 *
 *      [import,title:<the title>](path/to/file)
 */

/* Get the specified <the title>
 * @example:
 *     getTitle(keyValObject)
 * @param keyValObject
 * @return {boolean,string}
 */
export function getTitle(keyValObject) {
    return keyValObject.title;
}

/* Check if a title is specified in the option
 * @param keyValObject
 * @return {boolean}
 */
export function hasTitle(keyValObject) {
    const title = getTitle(keyValObject);
    return (title !== undefined);
}
