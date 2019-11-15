// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import TextSetting from 'components/widgets/settings/text_setting';

import SetByEnv from './set_by_env';

interface Props {
    id: string;
    label: React.ReactNode;
    value: string | number;
    setByEnv: boolean;
    disabled?: boolean;
    sharedProps?: any[];
}
const AdminTextSetting: React.SFC<Props> = (props: Props) => {
    const {setByEnv, id, label, value, ...sharedProps} = props;
    const isTextDisabled = props.disabled || props.setByEnv;

    return (
        <TextSetting
            {...sharedProps}
            id={id}
            label={label}
            value={value}
            labelClassName='col-sm-4'
            inputClassName='col-sm-8'
            disabled={isTextDisabled}
            footer={setByEnv ? <SetByEnv/> : null}
        />
    );
};

export default AdminTextSetting;
