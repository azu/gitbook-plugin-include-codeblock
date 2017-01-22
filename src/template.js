// LICENSE : MIT
const fs = require("fs");
import {defaultBookOptionsMap, defaultKeyValueMap, defaultTemplateMap} from "./options.js";
/**
 * Load template from template label
 * @param {object} kvMap
 * @return {string}
 */
export function getTemplateContent(kvMap)
{
    const t = kvMap.get('template');
    const dt = defaultBookOptionsMap.get('template');
    const tPath = defaultTemplateMap.get(t);
    const dtPath = defaultTemplateMap.get(dt);

    const isTemplateDefault = (t == dt);
    const isTemplatePath = (tPath == undefined);

    let p;
    // No template option.
    if(isTemplateDefault) {
        p = dtPath;
    }
    // Template option is a path.
    else if (isTemplatePath) {
        p = t;
    }
    // Template option one of template/ directory.
    else {
        p = tPath || dtPath;
    }   
    const content = readFileFromPath(p);
    return content;
}

/**
 * Sunc file read with path check
 * @param {string} path
 * @return {string}
 */
export function readFileFromPath(path)
{
    try {
    var content = fs.readFileSync(path, 'utf8')
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            logger.warn('Error: page: file not found: ' + path);
            return 'Error: file not found: ' + path;
        } else {
            throw err;
        }
    }
    return content;
}
