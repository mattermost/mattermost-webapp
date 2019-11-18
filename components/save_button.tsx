// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {injectIntl, IntlShape} from 'react-intl';

import LoadingWrapper from 'components/widgets/loading/loading_wrapper';

type Props = {
    intl: IntlShape;
    saving?: boolean;
    disabled?: boolean;
    id?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    savingMessage?: React.ReactNode;
    defaultMessage?: React.ReactNode;
    btnClass?: string;
    extraClasses?: string;
}
class SaveButton extends React.PureComponent<Props> {
    public static defaultProps: Partial<Props> = {
        disabled: false,
        btnClass: 'btn-primary',
        extraClasses: '',
    }

    public render() {
        const {formatMessage} = this.props.intl;
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

export default injectIntl(SaveButton);
