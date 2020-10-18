// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable import/order */
import de from './de.json';
import es from './es.json';
import fr from './fr.json';
import it from './it.json';
import ja from './ja.json';
import ko from './ko.json';
import nl from './nl.json';
import pl from './pl.json';
import ptBR from './pt-BR.json';
import ro from './ro.json';
import ru from './ru.json';
import tr from './tr.json';
import uk from './uk.json';
import zhTW from './zh-TW.json';
import zhCN from './zh-CN.json';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import store from 'stores/redux_store.jsx';

// should match the values in model/config.go
const languages = {
    de: {
        value: 'de',
        name: 'Deutsch',
        order: 0,
        url: de,
    },
    en: {
        value: 'en',
        name: 'English',
        order: 1,
        url: '',
    },
    es: {
        value: 'es',
        name: 'Español',
        order: 2,
        url: es,
    },
    fr: {
        value: 'fr',
        name: 'Français',
        order: 3,
        url: fr,
    },
    it: {
        value: 'it',
        name: 'Italiano',
        order: 4,
        url: it,
    },
    ja: {
        value: 'ja',
        name: '日本語',
        order: 15,
        url: ja,
    },
    ko: {
        value: 'ko',
        name: '한국어 (Alpha)',
        order: 12,
        url: ko,
    },
    nl: {
        value: 'nl',
        name: 'Nederlands',
        order: 5,
        url: nl,
    },
    pl: {
        value: 'pl',
        name: 'Polski',
        order: 6,
        url: pl,
    },
    'pt-BR': {
        value: 'pt-BR',
        name: 'Português (Brasil)',
        order: 7,
        url: ptBR,
    },
    ro: {
        value: 'ro',
        name: 'Română',
        order: 8,
        url: ro,
    },
    ru: {
        value: 'ru',
        name: 'Pусский',
        order: 10,
        url: ru,
    },
    tr: {
        value: 'tr',
        name: 'Türkçe',
        order: 9,
        url: tr,
    },
    uk: {
        value: 'uk',
        name: 'Yкраїнська (Alpha)',
        order: 11,
        url: uk,
    },
    'zh-TW': {
        value: 'zh-TW',
        name: '中文 (繁體)',
        order: 14,
        url: zhTW,
    },
    'zh-CN': {
        value: 'zh-CN',
        name: '中文 (简体)',
        order: 13,
        url: zhCN,
    },
};

export function getAllLanguages() {
    return languages;
}

export function getLanguages() {
    const config = getConfig(store.getState());
    if (!config.AvailableLocales) {
        return getAllLanguages();
    }
    return config.AvailableLocales.split(',').reduce((result, l) => {
        if (languages[l]) {
            result[l] = languages[l];
        }
        return result;
    }, {});
}

export function getLanguageInfo(locale) {
    return getAllLanguages()[locale];
}

export function isLanguageAvailable(locale) {
    return Boolean(getLanguages()[locale]);
}

export function doAddLocaleData() {
    if (!Intl.PluralRules) {
        // eslint-disable-next-line global-require
        require('@formatjs/intl-pluralrules/polyfill-locales');
    }

    if (!Intl.RelativeTimeFormat) {
        // eslint-disable-next-line global-require
        require('@formatjs/intl-relativetimeformat/polyfill-locales');
    }
}
