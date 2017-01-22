// LICENSE : MIT
"use strict";
const path = require('path');
const language_map = require('language-map');
const logger = require('winston-color');
import {defaultKeyValueMap} from "./options.js";

// Workaround for not working languages.
// Redefine aceMode locally.
// @param {string}
// @return {string}
export function languageAceModeFix( resultAceMode ) {
    if (resultAceMode == 'c_cpp')
    {
        resultAceMode = 'cpp';
    }
    return resultAceMode;
}

/**
 * Return aceMode from lang in kvMap.
 * @param {object} kvMap
 * @return {object}
 */
export function lookupLanguageByAceMode( kvMap ) {
    let resultAceMode;
    const matchLang = kvMap.get("lang");
    Object.keys(language_map).some(langKey => {
        const aceMode = language_map[langKey]["aceMode"];
        if (matchLang === aceMode) {
            resultAceMode = aceMode;
        }
    });
    return resultAceMode;
}

/**
 * Return aceMode from file extension or lang in kvMap, if is 
 * an extension.
 * @param {object} kvMap
 * @param {string} filePath
 * @return {object}
 */
export function lookupLanguageByExtension( kvMap, filePath ) {
    const lang = kvMap.get("lang");
    let ext = undefined;
    // Check first if map `lang` is an extension string.
    const matchext = /(.+)/g.exec(lang);
    if (matchext != null) {
        ext = matchext[1];
    }
    // Load from file extension.
    else {
        ext = path.extname(filePath);
    }
    let aceMode;
    Object.keys(language_map).some(langKey => {
        const extensions = language_map[langKey]["extensions"];
        if (!extensions) {
            return false;
        }
        return extensions.some(extension => {
            if (ext === extension) {
                aceMode = language_map[langKey]["aceMode"];
            }
        });
    });
    return aceMode;
}

/**
 * Update key-value map lang with aceMode lang.
 * @param {object} kvMap
 * @param {string} filePath
 * @return {object}
 */
export function getLang( kvMap, filePath ) {
    let aceMode=undefined;
    // Retrieve ace mode from lang.
    if( kvMap.get("lang") !== defaultKeyValueMap.get("lang") ) {
        aceMode = lookupLanguageByAceMode( kvMap );
    }
    // Retrieve ace mode from file ext or lang ext.
    if ( aceMode === undefined ) {
        aceMode = lookupLanguageByExtension(kvMap, filePath);
    }
    // Ace mode not found, keep default.
    if ( aceMode === undefined ) {
        logger.warn("include-codeblock: unknown language `" + kvMap.get("lang") + "`, use default");
        return kvMap;
    }
    if( kvMap.get("fixlang") ) {
        aceMode = languageAceModeFix(aceMode);
    }
    return kvMap.set("lang",aceMode);
}
