// LICENSE : MIT
"use strict";
const path = require('path');
const language_map = require('language-map');
export function lookupLanguageByAceMode(commands) {
    let resultAceMode;
    commands.forEach(command => {
        const matchAceModes = /lang\-(.+)/g.exec(command);
        if (matchAceModes == null) {
            return
        }
        const matchLang = matchAceModes[1];
        if (!matchLang) {
            return;
        }
        Object.keys(language_map).some(langKey => {
            const aceMode = language_map[langKey]["aceMode"];
            if (matchLang === aceMode) {
                resultAceMode = aceMode;
            }
        });
        // not found the `matchLang` in AceMode
        if (resultAceMode === undefined) {
            resultAceMode = matchLang;
        }
    });
    return resultAceMode;
}

export function lookupLanguageByExtension(ext) {
    let aceMode;
    Object.keys(language_map).some(langKey => {
        const extensions = language_map[langKey]["extensions"];
        /* TODO: These lang has not extensions
         Ant Build System
         Isabelle ROOT
         Maven POMAnt Build System
         */
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

export function getLang(commands, filePath) {
    const lang = lookupLanguageByAceMode(commands);
    if (lang) {
        return lang;
    }
    const ext = path.extname(filePath);
    return lookupLanguageByExtension(ext) || ext;
}