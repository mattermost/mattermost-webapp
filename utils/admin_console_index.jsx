// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import FlexSearch from 'flexsearch/dist/flexsearch.es5';

import {getPluginEntries} from './admin_console_plugin_index';

function extractTextsFromSection(section, intl) {
    const texts = [];
    if (section.title) {
        texts.push(intl.formatMessage({id: section.title, defaultMessage: section.title_default}));
    }
    if (section.schema && section.schema.name) {
        texts.push(section.schema.name);
    }
    if (section.searchableStrings) {
        for (const searchableString of section.searchableStrings) {
            if (typeof searchableString === 'string') {
                texts.push(intl.formatMessage({id: searchableString, defaultMessage: searchableString}));
            } else {
                texts.push(intl.formatMessage({id: searchableString[0], defaultMessage: ''}, searchableString[1]));
            }
        }
    }

    if (section.schema && section.schema.settings) {
        for (const setting of Object.values(section.schema.settings)) {
            if (setting.label) {
                texts.push(intl.formatMessage({id: setting.label, defaultMessage: setting.label_default}, setting.label_values));
            }
            if (setting.help_text && typeof setting.help_text === 'string') {
                texts.push(intl.formatMessage({id: setting.help_text, defaultMessage: setting.help_text_default}, setting.help_text_values));
            }
            if (setting.remove_help_text) {
                texts.push(intl.formatMessage({id: setting.remove_help_text, defaultMessage: setting.remove_help_text_default}));
            }
            if (setting.remove_button_text) {
                texts.push(intl.formatMessage({id: setting.remove_button_text, defaultMessage: setting.remove_button_text_default}));
            }
        }
    }
    return texts;
}

export function adminDefinitionsToUrlsAndTexts(adminDefinition, intl) {
    const entries = {};
    for (const item of Object.values(adminDefinition.about)) {
        entries[item.url] = extractTextsFromSection(item, intl);
    }
    for (const item of Object.values(adminDefinition.reporting)) {
        entries[item.url] = extractTextsFromSection(item, intl);
    }
    for (const item of Object.values(adminDefinition.user_management)) {
        entries[item.url] = extractTextsFromSection(item, intl);
    }
    for (const item of Object.values(adminDefinition.environment)) {
        entries[item.url] = extractTextsFromSection(item, intl);
    }
    for (const item of Object.values(adminDefinition.site)) {
        entries[item.url] = extractTextsFromSection(item, intl);
    }
    for (const item of Object.values(adminDefinition.authentication)) {
        entries[item.url] = extractTextsFromSection(item, intl);
    }
    for (const item of Object.values(adminDefinition.plugins)) {
        entries[item.url] = extractTextsFromSection(item, intl);
    }
    for (const item of Object.values(adminDefinition.integrations)) {
        entries[item.url] = extractTextsFromSection(item, intl);
    }
    for (const item of Object.values(adminDefinition.compliance)) {
        entries[item.url] = extractTextsFromSection(item, intl);
    }
    for (const item of Object.values(adminDefinition.experimental)) {
        entries[item.url] = extractTextsFromSection(item, intl);
    }
    return entries;
}

export function generateIndex(AdminDefinition, plugins, intl) {
    const idx = new FlexSearch();

    addToIndex(adminDefinitionsToUrlsAndTexts(AdminDefinition, intl), idx);

    addToIndex(getPluginEntries(plugins), idx);

    return idx;
}

function addToIndex(entries, idx) {
    for (const key of Object.keys(entries)) {
        let text = '';
        for (const str of entries[key]) {
            text += ' ' + str;
        }
        idx.add(key, text);
    }
}

