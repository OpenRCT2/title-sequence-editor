/// <reference path="strings.ar-EG.ts" />
/// <reference path="strings.ca-ES.ts" />
/// <reference path="strings.cs-CZ.ts" />
/// <reference path="strings.da-DK.ts" />
/// <reference path="strings.de-DE.ts" />
/// <reference path="strings.en-GB.ts" />
/// <reference path="strings.en-US.ts" />
/// <reference path="strings.eo-ZZ.ts" />
/// <reference path="strings.es-ES.ts" />
/// <reference path="strings.fi-FI.ts" />
/// <reference path="strings.fr-FR.ts" />
/// <reference path="strings.hu-HU.ts" />
/// <reference path="strings.it-IT.ts" />
/// <reference path="strings.ja-JP.ts" />
/// <reference path="strings.ko-KR.ts" />
/// <reference path="strings.nb-NO.ts" />
/// <reference path="strings.nl-NL.ts" />
/// <reference path="strings.pl-PL.ts" />
/// <reference path="strings.pt-BR.ts" />
/// <reference path="strings.ru-RU.ts" />
/// <reference path="strings.sv-SE.ts" />
/// <reference path="strings.tr-TR.ts" />
/// <reference path="strings.vi-VN.ts" />
/// <reference path="strings.zh-CN.ts" />
/// <reference path="strings.zh-TW.ts" />

const strings: { [lang: string]: { [name: string]: string } } = {
    'ar-EG': arEG,
    'ca-ES': caES,
    'cs-CZ': csCZ,
    'da-DK': daDK,
    'de-DE': deDE,
    'en-GB': enGB,
    'en-US': enUS,
    'eo-ZZ': eoZZ,
    'es-ES': esES,
    'fi-FI': fiFI,
    'fr-FR': frFR,
    'hu-HU': huHU,
    'it-IT': itIT,
    'ja-JP': jaJP,
    'ko-KR': koKR,
    'nb-NO': nbNO,
    'nl-NL': nlNL,
    'pl-PL': plPL,
    'pt-BR': ptBR,
    'ru-RU': ruRU,
    'sv-SE': svSE,
    'tr-TR': trTR,
    'vi-VN': viVN,
    'zh-CN': zhCN,
    'zh-TW': zhTW,
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
