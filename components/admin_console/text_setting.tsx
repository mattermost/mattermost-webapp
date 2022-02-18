// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import TextSetting, {WidgetTextSettingProps} from 'components/widgets/settings/text_setting';
import FormError from 'components/form_error';

import SetByEnv from './set_by_env';

interface Props extends WidgetTextSettingProps {
    setByEnv: boolean;
    disabled?: boolean;
}

const AdminTextSetting: React.FunctionComponent<Props> = (props: Props): JSX.Element => {
    const {setByEnv, disabled, required, requiredText, value, ...sharedProps} = props;
    const isTextDisabled = disabled || setByEnv;

    let footer = (required && !value) ? (
        <FormError
            error={requiredText}
            type='backstage'
        />
    ) : null;
    if (setByEnv) {
        footer = <SetByEnv/>;
    }

    return (
        <TextSetting
            {...sharedProps}
            value={value}
            labelClassName='col-sm-4'
            inputClassName='col-sm-8'
            disabled={isTextDisabled}
            footer={footer}
        />
    );
};

export default AdminTextSetting;
