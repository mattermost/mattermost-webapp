// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import TextSetting, {WidgetTextSettingProps} from 'components/widgets/settings/text_setting';

import SetByEnv from './set_by_env';

interface Props extends WidgetTextSettingProps {
    setByEnv: boolean;
}

const AdminTextSetting: React.SFC<Props> = (props: Props): JSX.Element => {
    const {setByEnv, disabled, ...sharedProps} = props;
    const isTextDisabled = props.disabled || props.setByEnv;

    return (
        <TextSetting
            {...sharedProps}
            labelClassName='col-sm-4'
            inputClassName='col-sm-8'
            disabled={isTextDisabled}
            footer={setByEnv ? <SetByEnv/> : null}
        />
    );
};

export default AdminTextSetting;
