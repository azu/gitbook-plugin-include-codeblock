// LICENSE : MIT
/*
 * Gibook usage:
 *
 *      [import,title:<the title>](path/to/file)
 */

/*
 * format: [import,title:<the title>](path/to/file)
 * Get the specified <the title>
 * @example:
 *     getTitle(keyValObject)
 *
 * @return {boolean,string}
 */
export function getTitle(keyValObject) {
    return keyValObject.title;
}

export function hasTitle(keyValObject) {
    const title = getTitle(keyValObject);
    return (title !== undefined);
}
