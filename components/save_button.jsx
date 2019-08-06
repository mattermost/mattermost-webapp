// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {intlShape} from 'react-intl';

import LoadingWrapper from 'components/widgets/loading/loading_wrapper.jsx';

export default class SaveButton extends React.PureComponent {
    static propTypes = {
        saving: PropTypes.bool.isRequired,
        disabled: PropTypes.bool,
        savingMessage: PropTypes.node,
        defaultMessage: PropTypes.node,
        btnClass: PropTypes.string,
        extraClasses: PropTypes.string,
    }

    static defaultProps = {
        disabled: false,
        btnClass: 'btn-primary',
        extraClasses: '',
    }

    static contextTypes = {
        intl: intlShape,
    };

    render() {
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
