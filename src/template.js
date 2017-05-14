// LICENSE : MIT
"use strict";
const fs = require("fs");
const logger = require("winston-color");
const request = require("sync-request");
import {defaultBookOptionsMap, defaultTemplateMap} from "./options.js";

/**
 * Sync file read with path check
 * @param {string} path
 * @return {string}
 */
export function readFileFromPath(path){
    var content;
    try {
        content = fs.readFileSync(path, "utf8");
    } catch (err) {
        if (err.code === "ENOENT") {
            logger.warn("Error: file not found: " + path);
            return null;
        } else {
            throw err;
        }
    }
    return content;
}

/** 
 * Sync file read with url check 
 * @param {string} url 
 * @return {string} 
 */
export function readFileFromURL(url) {
    var content;
    try {
        content = request("GET", url).getBody("utf8");
    } catch (err) {
        logger.warn("Error: url not found: " + url);
        return null;
    }
    return content;
}

/**
 * Load template from template label
 * @param {object} kvMap
 * @return {string}
 */
export function getTemplateContent(kvMap){
    const t = kvMap.template;
    const dt = defaultBookOptionsMap.template;
    const tPath = defaultTemplateMap[t];
    const dtPath = defaultTemplateMap[dt];

    const isTemplateDefault = (t == dt);
    const isTemplatePath = (tPath == undefined);

    let p;
    // No template option.
    if(isTemplateDefault) {
        p = dtPath;
    } else if (isTemplatePath) {
        // Template option is a path.
        p = t;
    } else {
        // Template option one of template/ directory.
        p = tPath || dtPath;
    }   
    const content = readFileFromPath(p);
    return content;
}
