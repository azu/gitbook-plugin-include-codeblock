// LICENSE : MIT
"use strict";
const path = require('path');
const language_map = require('language-map');

// Workaround for not working languages.
// Redefine aceMode locally.
export function languageAceModeFix(resultAceMode) {
    if (resultAceMode == 'c_cpp')
    {
        resultAceMode = 'cpp';
    }
    return resultAceMode;
}

export function lookupLanguageByAceMode(commands, fixlang=false) {
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
    if(fixlang) {
        resultAceMode = languageAceModeFix(resultAceMode);
    }
    return resultAceMode;
}

export function lookupLanguageByExtension(ext, fixlang=false) {
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
    if(fixlang) {
        aceMode = languageAceModeFix(aceMode);
    }
    return aceMode;
}

export function getLang(commands, filePath, fixlang=false ) {
    const lang = lookupLanguageByAceMode(commands);
    if (lang) {
        return lang;
    }
    const ext = path.extname(filePath);
    return lookupLanguageByExtension(ext, fixlang) || ext;
}
