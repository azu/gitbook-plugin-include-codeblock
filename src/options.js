// LICENSE : MIT
// Note: if you add new options type, you have to update checks in parser.js
// for these types (see parseVariableFromMap).
const immutable = require("immutable");
const logger = require('winston-color');
const path = require("path");
const cfg = require("../package").gitbook.properties;

export const defaultTemplateMap = immutable.Map({
    default: path.join(__dirname, "..", "templates", "default-template.hbs"),
    full: path.join(__dirname, "..", "templates", "full-template.hbs"),
    ace: path.join(__dirname, "..", "templates", "ace-template.hbs"),
    acefull: path.join(__dirname, "..", "templates", "acefull-template.hbs")
});

// Map for Book.json options. (avoid `undefined` for ace options),
// NN: Default book option, type, desc are set in the package.json file.
export const defaultBookOptionsMap = immutable.Map({
    check: cfg.check.default,
    edit: cfg.edit.default,
    fixlang: cfg.fixlang.default,
    template: cfg.template.default,
    theme: cfg.theme.default,
    unindent: cfg.unindent.default
});

// Possible command key-values (kv).
// (avoid undefined default value because we check value types).
export const defaultKeyValueMap = immutable.Map({
    // Local
    class: "",
    id: "",
    marker: "",
    name: "",
    title: "",
    // Global/Local
    check: defaultBookOptionsMap.get('check'),
    edit: defaultBookOptionsMap.get('edit'),
    fixlang: defaultBookOptionsMap.get('fixlang'),
    template: defaultBookOptionsMap.get('template'),
    theme: defaultBookOptionsMap.get('theme'),
    unindent: defaultBookOptionsMap.get('unindent')
});

/**
 * Check that maps types equal to default key value map. 
 * @param {{template?: string}} options
 * @return {object} kvMap
 */
export function initOptions( options )
{
    const dbom = defaultBookOptionsMap;
    const kv = defaultKeyValueMap.toObject();
    // Overwrite default value with user book options.
    dbom.keySeq().forEach( key => {
        if (options[key] != undefined) {
            kv[key] = convertValue(options[key],typeof dbom.get(key));
        };
    });
    const kvmap = immutable.Map(kv);
    checkMapTypes( kvmap, "initOptions" );
    return kvmap
}

/**
 * Check that maps types equal to default key value map. 
 * @param {object} kvMap
 * @param {string} funcLabel
 */
export function checkMapTypes( kvMap, funcLabel ) {
    kvMap.keySeq().forEach( key => {
        if( defaultKeyValueMap.get(key) != undefined ) {
            if( !(typeof kvMap.get(key) === typeof defaultKeyValueMap.get(key)) ) {
                logger.error("include-codeblock: checkMapTypes (" + funcLabel +
                    ") : wrong value type for key `" + key + "`: "+
                    "key type: `"+ typeof kvMap.get(key) +
                    "` (!= `" + typeof defaultKeyValueMap.get(key) + "`)");
            }
        }
    });
}

export function convertValue( valstr, valtype )
{
    if ( valtype === "boolean" | "number" ) {   
        return JSON.parse(valstr);
    }
    return valstr
}
