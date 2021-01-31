/// <reference path="strings.en-GB.ts" />

const strings: { [lang: string]: { [name: string]: string } } = {
    'en-GB': enGB
};

var getString = (name: string) => {
    let lang = context.configuration.get<string>("general.language");
    if (lang && lang in strings) {
        let localised = strings[lang];
        if (name in localised) {
            return localised[name];
        }
    }

    // Fallback to en-GB
    if (name in enGB) {
        return enGB[name];
    }

    return '<unknown>';
};
