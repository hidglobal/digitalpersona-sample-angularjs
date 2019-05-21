import '../locales/en.json';

localization.$inject = ["$translateProvider"];
export default function localization(
    $translateProvider: angular.translate.ITranslateProvider
){
    var languages = {
        available: [
            "en",
            "es",
        ],
        aliases: {
            "en-*": "en",
            "es-*": "es",
        },
        default: "en"
    };

    $translateProvider
        .useLocalStorage()
        .registerAvailableLanguageKeys(languages.available, languages.aliases)
        .useStaticFilesLoader({
            prefix: "locales/",
            suffix: ".json"
        })
        .determinePreferredLanguage(getBrowserLanguage)
//        .fallbackLanguage("en");

    function getBrowserLanguage() {

        var lang = navigator.language || navigator["userLanguage"];

        if (languages.available.indexOf(lang) < 0
        &&  languages.available.indexOf(lang.split('-')[0]) < 0) {
            lang = languages.default;
        }
        return lang;
    }
}
