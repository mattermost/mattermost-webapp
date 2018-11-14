// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import SchemaAdminSettings from 'components/admin_console/schema_admin_settings.jsx';

describe('components/admin_console/SchemaAdminSettings', () => {
    let schema = null;
    let config = null;
    let environmentConfig = null;

    afterEach(() => {
        schema = null;
        config = null;
        environmentConfig = null;
    });

    beforeEach(() => {
        schema = {
            id: 'Config',
            name: 'config',
            name_default: 'Configuration',
            settings: [
                {
                    key: 'FirstSettings.settinga',
                    label: 'label-a',
                    label_default: 'Setting One',
                    type: 'text',
                    default: 'setting_default',
                    help_text: 'help-text-a',
                    help_text_default: 'This is some help text for the text field.',
                    placeholder: 'placeholder-a',
                    placeholder_default: 'e.g. some setting',
                },
                {
                    key: 'FirstSettings.settingb',
                    label: 'label-b',
                    label_default: 'Setting Two',
                    type: 'bool',
                    default: true,
                    help_text: 'help-text-b',
                    help_text_default: 'This is some help text for the bool field.',
                },
                {
                    key: 'FirstSettings.settingc',
                    label: 'label-c',
                    label_default: 'Setting Three',
                    type: 'dropdown',
                    default: 'option1',
                    options: [
                        {display_name: 'Option 1', value: 'option1'},
                        {display_name: 'Option 2', value: 'option2'},
                        {display_name: 'Option 3', value: 'option3'},
                    ],
                    help_text: 'help-text-c',
                    help_text_default: 'This is some help text for the dropdown field.',
                },
                {
                    key: 'SecondSettings.settingd',
                    label: 'label-d',
                    label_default: 'Setting Four',
                    type: 'radio',
                    default: 'option2',
                    options: [
                        {display_name: 'Option 1', value: 'option1'},
                        {display_name: 'Option 2', value: 'option2'},
                        {display_name: 'Option 3', value: 'option3'},
                    ],
                    help_text: 'help-text-d',
                    help_text_default: 'This is some help text for the radio field.',
                },
                {
                    key: 'SecondSettings.settinge',
                    label: 'label-e',
                    label_default: 'Setting Five',
                    type: 'generated',
                    help_text: 'help-text-e',
                    help_text_default: 'This is some help text for the generated field.',
                    regenerate_help_text: 'This is help text for the regenerate button.',
                    placeholder: 'placeholder-e',
                    placeholder_default: 'e.g. 47KyfOxtk5+ovi1MDHFyzMDHIA6esMWb',
                },
                {
                    key: 'SecondSettings.settingf',
                    label: 'label-f',
                    label_default: 'Setting Six',
                    type: 'username',
                    help_text: 'help-text-f',
                    help_text_default: 'This is some help text for the user autocomplete field.',
                    placeholder: 'placeholder-f',
                    placeholder_default: 'Type a username here',
                },
                {
                    key: 'SecondSettings.settingg',
                    label: 'label-g',
                    label_default: 'Setting Seven',
                    type: 'number',
                    default: 'setting_default',
                    help_text: 'help-text-g',
                    help_text_default: 'This is some help text for the number field.',
                    placeholder: 'placeholder-g',
                    placeholder_default: 'e.g. some setting',
                },
                {
                    key: 'SecondSettings.settingh',
                    label: 'label-h',
                    label_default: 'Setting Eight',
                    type: 'number',
                    default: 'setting_default',
                    help_text: 'help-text-h',
                    help_text_default: 'This is some help text for the number field.',
                    placeholder: 'placeholder-h',
                    placeholder_default: 'e.g. some setting',
                    onConfigLoad: (configVal) => configVal / 10,
                    onConfigSave: (displayVal) => displayVal * 10,
                },
                {
                    label: 'label-h',
                    label_default: 'Setting Eight',
                    type: 'banner',
                },
                {
                    key: 'SecondSettings.settingi',
                    label: 'label-i',
                    label_default: 'Setting Nine',
                    type: 'language',
                    help_text: 'help-text-i',
                    help_text_default: 'This is some help text for the language field.',
                    placeholder: 'placeholder-i',
                    placeholder_default: 'e.g. some setting',
                    multiple: false,
                },
                {
                    key: 'SecondSettings.settingj',
                    label: 'label-j',
                    label_default: 'Setting Nine',
                    type: 'language',
                    help_text: 'help-text-j',
                    help_text_default: 'This is some help text for the multiple-language field.',
                    placeholder: 'placeholder-j',
                    placeholder_default: 'e.g. some setting',
                    multiple: true,
                    no_result: 'no-result-j',
                    no_result_default: 'No result',
                    not_present: 'no-present-j',
                    not_present_default: 'No present',
                },
                {
                    key: 'SecondSettings.settingk',
                    label: 'label-k',
                    label_default: 'Setting Eleven',
                    type: 'button',
                    help_text: 'help-text-k',
                    help_text_default: 'This is some help text for the button field.',
                    action: () => null,
                    error_message: 'admin.reload.reloadFail',
                    error_message_default: 'Reload unsuccessful: {error}',
                },
                {
                    key: 'FirstSettings.settingl',
                    label: 'label-l',
                    label_default: 'Setting Twelve',
                    type: 'bool',
                    default: false,
                    help_text: 'help-text-l',
                    help_text_default: 'This is some help text for the second bool field.',
                },
                {
                    key: 'FirstSettings.settingm',
                    label: 'label-m',
                    label_default: 'Setting Thirteen',
                    type: 'color',
                    help_text: 'help-text-m',
                    help_text_default: 'This is some help text for the color field.',
                },
                {
                    type: 'custom',
                    key: 'custom',
                    component: () => <p>{'Test'}</p>,
                },
                {
                    type: 'jobstable',
                    label: 'label-l',
                    label_default: 'Setting Twelve',
                    help_text: 'help-text-l',
                    help_text_default: 'This is some help text for the jobs table field.',
                    job_type: 'test',
                    render_job: () => <p>{'Test'}</p>,
                },
                {
                    type: 'permission',
                    key: 'settingo',
                    label: 'label-o',
                    label_default: 'Setting Fourteen',
                    help_text: 'help-text-o',
                    help_text_default: 'This is some help text for the permissions field.',
                    permissions_mapping_name: 'enableOnlyAdminIntegrations',
                },
            ],
        };

        config = {
            FirstSettings: {
                settinga: 'fsdsdg',
                settingb: false,
                settingc: 'option3',
                settingl: true,
            },
            SecondSettings: {
                settingd: 'option1',
                settinge: 'Q6DHXrFLOIS5sOI5JNF4PyDLqWm7vh23',
                settingf: '3xz3r6n7dtbbmgref3yw4zg7sr',
                settingg: 7,
                settingh: 100,
            },
        };

        environmentConfig = {
            FirstSettings: {
                settingl: true,
            },
        };
    });

    test('should match snapshot with settings and plugin', () => {
        const wrapper = shallow(
            <SchemaAdminSettings
                config={config}
                environmentConfig={environmentConfig}
                schema={{...schema}}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with custom component', () => {
        const wrapper = shallow(
            <SchemaAdminSettings
                config={config}
                environmentConfig={environmentConfig}
                schema={{component: () => <p>{'Test'}</p>}}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
