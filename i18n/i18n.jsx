// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable import/order */
const de = require('./de.json');

const es = require('./es.json');

const fr = require('./fr.json');

const it = require('./it.json');

const ja = require('./ja.json');

const ko = require('./ko.json');

const nl = require('./nl.json');

const pl = require('./pl.json');

const ptBR = require('./pt-BR.json');

const ro = require('./ro.json');

const ru = require('./ru.json');

const tr = require('./tr.json');

const uk = require('./uk.json');

const zhTW = require('./zh-TW.json');

const zhCN = require('./zh-CN.json');

import {addLocaleData} from 'react-intl';
import deLocaleData from 'react-intl/locale-data/de';
import enLocaleData from 'react-intl/locale-data/en';
import esLocaleData from 'react-intl/locale-data/es';
import frLocaleData from 'react-intl/locale-data/fr';
import itLocaleData from 'react-intl/locale-data/it';
import jaLocaleData from 'react-intl/locale-data/ja';
import koLocaleData from 'react-intl/locale-data/ko';
import nlLocaleData from 'react-intl/locale-data/nl';
import plLocaleData from 'react-intl/locale-data/pl';
import ptLocaleData from 'react-intl/locale-data/pt';
import roLocaleData from 'react-intl/locale-data/ro';
import ruLocaleData from 'react-intl/locale-data/ru';
import trLocaleData from 'react-intl/locale-data/tr';
import ukLocaleData from 'react-intl/locale-data/uk';
import zhLocaleData from 'react-intl/locale-data/zh';
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
        name: 'Nederlands (Alpha)',
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
        name: 'Pусский (Alpha)',
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

export function safariFix(callback) {
    require.ensure([
        'intl',
        'intl/locale-data/jsonp/de.js',
        'intl/locale-data/jsonp/en.js',
        'intl/locale-data/jsonp/es.js',
        'intl/locale-data/jsonp/fr.js',
        'intl/locale-data/jsonp/it.js',
        'intl/locale-data/jsonp/ja.js',
        'intl/locale-data/jsonp/ko.js',
        'intl/locale-data/jsonp/nl.js',
        'intl/locale-data/jsonp/pl.js',
        'intl/locale-data/jsonp/pt.js',
        'intl/locale-data/jsonp/ro.js',
        'intl/locale-data/jsonp/ru.js',
        'intl/locale-data/jsonp/tr.js',
        'intl/locale-data/jsonp/uk.js',
        'intl/locale-data/jsonp/zh.js',
    ], (require) => {
        require('intl');
        require('intl/locale-data/jsonp/de.js');
        require('intl/locale-data/jsonp/en.js');
        require('intl/locale-data/jsonp/es.js');
        require('intl/locale-data/jsonp/fr.js');
        require('intl/locale-data/jsonp/it.js');
        require('intl/locale-data/jsonp/ja.js');
        require('intl/locale-data/jsonp/ko.js');
        require('intl/locale-data/jsonp/nl.js');
        require('intl/locale-data/jsonp/pl.js');
        require('intl/locale-data/jsonp/pt.js');
        require('intl/locale-data/jsonp/ro.js');
        require('intl/locale-data/jsonp/ru.js');
        require('intl/locale-data/jsonp/tr.js');
        require('intl/locale-data/jsonp/uk.js');
        require('intl/locale-data/jsonp/zh.js');
        callback();
    });
}

export function doAddLocaleData() {
    addLocaleData(enLocaleData);
    addLocaleData(deLocaleData);
    addLocaleData(esLocaleData);
    addLocaleData(frLocaleData);
    addLocaleData(itLocaleData);
    addLocaleData(jaLocaleData);
    addLocaleData(koLocaleData);
    addLocaleData(nlLocaleData);
    addLocaleData(plLocaleData);
    addLocaleData(ptLocaleData);
    addLocaleData(roLocaleData);
    addLocaleData(ruLocaleData);
    addLocaleData(trLocaleData);
    addLocaleData(ukLocaleData);
    addLocaleData(zhLocaleData);
}
