// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FormEvent, memo} from 'react';
import {useIntl} from 'react-intl';
import styled from 'styled-components';
import {SendIcon} from '@mattermost/compass-icons/components';

import {t} from 'utils/i18n';

type SendButtonProps = {
    handleSubmit: (e: FormEvent) => void;
    disabled: boolean;
}

const SendButtonContainer = styled.button`
    display: flex;
    height: 32px;
    padding: 0 16px;
    border: none;
    background: var(--button-bg);
    border-radius: 4px;
    color: var(--button-color);
    cursor: pointer;
    place-content: center;
    place-items: center;
    transition: color 150ms;

    &--disabled,
    &[disabled] {
        background: rgba(var(--center-channel-color-rgb), 0.08);

        svg {
            fill: rgba(var(--center-channel-color-rgb), 0.32);
        }
    }

    .android &,
    .ios & {
        display: flex;
    }
`;

const SendButton = ({disabled, handleSubmit}: SendButtonProps) => {
    const {formatMessage} = useIntl();
    return (
        <SendButtonContainer
            tabIndex={0}
            aria-label={formatMessage({
                id: 'create_post.send_message',
                defaultMessage: 'Send a message',
            })}
            disabled={disabled}
            onClick={handleSubmit}
        >
            <SendIcon
                size={18}
                color='currentColor'
                aria-label={formatMessage({
                    id: t('create_post.icon'),
                    defaultMessage: 'Create a post',
                })}
            />
        </SendButtonContainer>
    );
};

export default memo(SendButton);
