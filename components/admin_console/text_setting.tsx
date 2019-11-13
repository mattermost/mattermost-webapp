// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import TextSetting from 'components/widgets/settings/text_setting';
import SetByEnv from './set_by_env';

interface Props {
    setByEnv: boolean;
    disabled?: boolean;
}

const AdminTextSetting: React.SFC<Props> = props => {
    const { setByEnv, disabled, ...sharedProps } = props;

    return (
        <TextSetting
            {...sharedProps}
            labelClassName="col-sm-4"
            inputClassName="col-sm-8"
            disabled={disabled || setByEnv}
            footer={setByEnv ? <SetByEnv /> : null}
        />
    );
};


export default AdminTextSetting;
