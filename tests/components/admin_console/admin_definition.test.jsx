// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import yup from 'yup';

import adminDefinition from 'components/admin_console/admin_definition.jsx';
import {Constants} from 'utils/constants';

const baseShape = {
    label: yup.string().required(),
    label_default: yup.string().required(),
    needs_no_license: yup.boolean(),
    needs_license: yup.boolean(),
    needs: yup.array().of(yup.array().of(yup.string())),
};

const fieldShape = {
    ...baseShape,
    key: yup.string().required(),
    help_text: yup.string().required(),
    help_text_default: yup.string(),
    help_text_html: yup.boolean(),
    help_text_values: yup.object(),
};

const option = yup.object().shape({
    value: yup.string(),
    display_name: yup.string().required(),
    display_name_default: yup.string().required(),
});

const settingBanner = yup.object().shape({
    ...baseShape,
    type: yup.mixed().oneOf([Constants.SettingsTypes.TYPE_BANNER]),
    banner_type: yup.mixed().oneOf(['info', 'warning']),
});

const settingBool = yup.object().shape({
    type: yup.mixed().oneOf([Constants.SettingsTypes.TYPE_BOOL]),
    ...fieldShape,
});

const settingNumber = yup.object().shape({
    type: yup.mixed().oneOf([Constants.SettingsTypes.TYPE_NUMBER]),
    ...fieldShape,
});

const settingText = yup.object().shape({
    type: yup.mixed().oneOf([Constants.SettingsTypes.TYPE_TEXT]),
    ...fieldShape,
    placeholder: yup.string(),
    placeholder_default: yup.string(),
});

const settingButton = yup.object().shape({
    type: yup.mixed().oneOf([Constants.SettingsTypes.TYPE_BUTTON]),
    ...fieldShape,
    action: yup.object(),
    error_message: yup.string().required(),
    error_message_default: yup.string().required(),
});

const settingLanguage = yup.object().shape({
    type: yup.mixed().oneOf([Constants.SettingsTypes.TYPE_LANGUAGE]),
    ...fieldShape,
});

const settingMultiLanguage = yup.object().shape({
    type: yup.mixed().oneOf([Constants.SettingsTypes.TYPE_LANGUAGE]),
    ...fieldShape,
    multiple: yup.boolean(),
    no_result: yup.string().required(),
    no_result_default: yup.string().required(),
    not_present: yup.string().required(),
    not_present_default: yup.string().required(),
});

const settingDropdown = yup.object().shape({
    type: yup.mixed().oneOf([Constants.SettingsTypes.TYPE_DROPDOWN]),
    ...fieldShape,
    options: yup.array().of(option),
});

const settingCustom = yup.object().shape({
    type: yup.mixed().oneOf([Constants.SettingsTypes.TYPE_CUSTOM]),
    ...baseShape,
    component: yup.object().required(),
});

const setting = yup.mixed().test('is-setting', 'not a valid setting', (value) => {
    let valid = false;
    valid = valid || settingBanner.isValidSync(value);
    valid = valid || settingBool.isValidSync(value);
    valid = valid || settingNumber.isValidSync(value);
    valid = valid || settingText.isValidSync(value);
    valid = valid || settingButton.isValidSync(value);
    valid = valid || settingLanguage.isValidSync(value);
    valid = valid || settingMultiLanguage.isValidSync(value);
    valid = valid || settingDropdown.isValidSync(value);
    valid = valid || settingCustom.isValidSync(value);
    return valid;
});

var schema = yup.object().shape({
    id: yup.string().required(),
    name: yup.string().required(),
    name_default: yup.string().required(),
    settings: yup.array().of(setting).required(),
});

var customComponentSchema = yup.object().shape({
    id: yup.string().required(),
    component: yup.object().required(),
});

var definition = yup.object().shape({
    reporting: yup.object().shape({
        system_analytics: yup.object().shape({schema: customComponentSchema}),
        team_analytics: yup.object().shape({schema: customComponentSchema}),
        system_users: yup.object().shape({schema: customComponentSchema}),
        server_logs: yup.object().shape({schema: customComponentSchema}),
    }),
    settings: yup.object().shape({
        general: yup.object().shape({
            configuration: yup.object().shape({schema}),
            localization: yup.object().shape({schema}),
            users_and_teams: yup.object().shape({schema}),
            privacy: yup.object().shape({schema}),
            compliance: yup.object().shape({schema}),
        }),
        authentication: yup.object().shape({
            email: yup.object().shape({schema}),
            mfa: yup.object().shape({schema}),
        }),
        security: yup.object().shape({}),
        notifications: yup.object().shape({}),
        integrations: yup.object().shape({
            custom: yup.object().shape({schema}),
        }),
        plugins: yup.object().shape({}),
        files: yup.object().shape({}),
        customization: yup.object().shape({}),
        compliance: yup.object().shape({}),
        advanced: yup.object().shape({}),
    }),
    other: yup.object().shape({
        license: yup.object().shape({schema: customComponentSchema}),
        audits: yup.object().shape({schema: customComponentSchema}),
    }),
});

describe('components/admin_console/admin_definition', () => {
    test('should pass all validations checks', () => {
        definition.strict().validateSync(adminDefinition);
    });
});
