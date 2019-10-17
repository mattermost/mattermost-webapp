// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {samplePlugin1, samplePlugin2} from '../tests/helpers/admin_console_plugin_index_sample_pluings';

import {getPluginEntries} from './admin_console_plugin_index';

describe('AdminConsolePluginsIndex.getPluginEntries', () => {
    it('should return an empty map in case of plugins is undefined', () => {
        const entries = getPluginEntries();
        expect(entries).toEqual({});
    });

    it('should return an empty map in case of plugins is null', () => {
        const entries = getPluginEntries(null);
        expect(entries).toEqual({});
    });

    it('should return an empty map in case of plugins is empty', () => {
        const entries = getPluginEntries({});
        expect(entries).toEqual({});
    });

    it('should return map with the text extracted from plugins', () => {
        const entries = getPluginEntries({[samplePlugin1.id]: samplePlugin1});
        expect(entries).toMatchSnapshot();
        expect(entries).toHaveProperty('plugin_mattermost-autolink');
    });

    it('should return map with the text extracted from plugins', () => {
        const entries = getPluginEntries({[samplePlugin1.id]: samplePlugin1, [samplePlugin2.id]: samplePlugin2});
        expect(entries).toMatchSnapshot();
        expect(entries).toHaveProperty('plugin_mattermost-autolink');
        expect(entries).toHaveProperty('plugin_Some-random-plugin');
    });
});
