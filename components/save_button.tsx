// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {intlShape} from 'react-intl';

import LoadingWrapper from 'components/widgets/loading/loading_wrapper';

type Props = {
    saving: boolean;
    disabled?: boolean;
    savingMessage?: React.ReactNode;
    defaultMessage?: React.ReactNode;
    btnClass?: string;
    extraClasses?: string;
}

export default class SaveButton extends React.PureComponent<Props> {
    public static defaultProps: Partial<Props> = {
        disabled: false,
        btnClass: 'btn-primary',
        extraClasses: '',
    }

    public static contextTypes = {
        intl: intlShape,
    };

    public render() {
        const {formatMessage} = this.context.intl;
        const {
            saving,
            disabled,
            savingMessage,
            defaultMessage,
            btnClass,
            extraClasses,
            ...props
        } = this.props;

        let className = 'save-button btn';
        if (!disabled || saving) {
            className += ' ' + btnClass;
        }

        if (extraClasses) {
            className += ' ' + extraClasses;
        }

        const savingMessageComponent = savingMessage || formatMessage({id: 'save_button.saving', defaultMessage: 'Saving'});
        const defaultMessageComponent = defaultMessage || formatMessage({id: 'save_button.save', defaultMessage: 'Save'});

        return (
            <button
                type='submit'
                id='saveSetting'
                className={className}
                disabled={disabled}
                {...props}
            >
                <LoadingWrapper
                    loading={saving}
                    text={savingMessageComponent}
                >
                    <span>{defaultMessageComponent}</span>
                </LoadingWrapper>
            </button>
        );
    }
}
