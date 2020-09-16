// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';

import './text_card_with_action.scss';

export default function TextCardWithAction(props: {
    cardBodyMessageId: string;
    cardBodyDefaultMessage: string;
    buttonMessageId: string;
    buttonDefaultMessage: string;
    onClick: () => void;
}) {
    return (
        <div className={'TextCardWithAction'}>
            <div className={'card-body'}>
                <FormattedMessage
                    id={props.cardBodyMessageId}
                    defaultMessage={props.cardBodyDefaultMessage}
                />
            </div>
            <div className='NextStepsView__wizardButtons'>
                <button
                    className='NextStepsView__button NextStepsView__finishButton primary'
                    onClick={props.onClick}
                >
                    <FormattedMessage
                        id={props.buttonMessageId}
                        defaultMessage={props.buttonDefaultMessage}
                    />
                </button>
            </div>
        </div>
    );
}

