// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import FlexSearch from 'flexsearch';

import AdminDefinition from 'components/admin_console/admin_definition.jsx';

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
    for (const item of Object.values(adminDefinition.reporting)) {
        entries[item.url] = extractTextsFromSection(item, intl);
    }
    for (const item of Object.values(adminDefinition.other)) {
        entries[item.url] = extractTextsFromSection(item, intl);
    }
    for (const item of Object.values(adminDefinition.settings)) {
        for (const key of Object.keys(item)) {
            const subitem = item[key];
            if (typeof subitem === 'object' && 'schema' in subitem) {
                entries[item.url + '/' + subitem.url] = extractTextsFromSection(subitem, intl);
            }
        }
    }
    return entries;
}

export function generateIndex(intl) {
    const idx = new FlexSearch();
    const mappingSectionsToTexts = adminDefinitionsToUrlsAndTexts(AdminDefinition, intl);
    for (const key of Object.keys(mappingSectionsToTexts)) {
        let text = '';
        for (const str of mappingSectionsToTexts[key]) {
            text += ' ' + str;
        }
        idx.add(key, text);
    }
    return idx;
}

