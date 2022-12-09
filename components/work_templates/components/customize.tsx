// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';

import PublicPrivateSelector from 'components/widgets/public-private-selector/public-private-selector';
import Constants from 'utils/constants';

import {Visibility} from '@mattermost/types/work_templates';
import {ChannelType} from '@mattermost/types/channels';

export interface CustomizeProps {
    className?: string;
    name: string;
    visibility: Visibility;

    onNameChanged: (name: string) => void;
    onVisibilityChanged: (visibility: Visibility) => void;
}

const Customize = ({
    name,
    visibility,
    onNameChanged,
    onVisibilityChanged,
    ...props
}: CustomizeProps) => {
    const {formatMessage} = useIntl();

    const privacySelectorValue = (visibility === Visibility.Public ? Constants.OPEN_CHANNEL : Constants.PRIVATE_CHANNEL) as ChannelType;
    const onPrivacySelectorChanged = (value: ChannelType) => {
        onVisibilityChanged(value === Constants.PRIVATE_CHANNEL ? Visibility.Private : Visibility.Public);
    };

    return (
        <div className={props.className}>
            <div className='name-section-container'>
                <p>
                    <strong>
                        {formatMessage({id: 'work_templates.customize.name_title', defaultMessage: 'What project is this for?'})}
                    </strong>
                </p>
                <p className='customize-name-text'>
                    {formatMessage({id: 'work_templates.customize.name_description', defaultMessage: 'This will help you and others find your project items. You can always edit this later.'})}
                </p>
                <input
                    type='text'
                    autoFocus={true}
                    placeholder={formatMessage({id: 'work_templates.customize.name_input_placeholder', defaultMessage: 'e.g. Web app, Growth, etc.'})}
                    value={name}
                    onChange={(e) => onNameChanged(e.target.value)}
                />
            </div>
            <div className='visibility-section-container'>
                <p>
                    <strong>
                        {formatMessage({id: 'work_templates.customize.visibility_title', defaultMessage: 'Who should have access to this?'})}
                    </strong>
                </p>
                <PublicPrivateSelector
                    selected={privacySelectorValue}
                    onChange={onPrivacySelectorChanged}
                />
            </div>
        </div>
    );
};

const StyledCustomized = styled(Customize)`
    display: flex;
    flex-direction: column;
    width: 509px;
    margin: 0 auto;

    .public-private-selector {
        flex-direction: column;
        &-button {
            margin-bottom: 8px;
            &:not(:first-child) {
                margin-left: 0px;
            }
        }
    }

    strong {
        font-weight: 600;
        font-size: 14px;
        line-height: 20px;
        color: var(--center-channel-text);
    }

    input {
        padding: 10px 16px;
        font-size: 14px;
        width: 100%;
        border-radius: 4px;
        border: 1px solid rgba(var(--center-channel-text-rgb), 0.16);
        &:focus {
            border: 2px solid var(--button-bg);
        }
    }

    .name-section-container {
        margin-top: 33px;
    }

    .visibility-section-container {
        margin-top: 56px;
    }

    .customize-name-text {
        font-size: 12px;
    }
`;

export default StyledCustomized;

