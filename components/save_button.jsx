// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {localizeMessage} from 'utils/utils.jsx';

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
        savingMessage: localizeMessage('save_button.saving', 'Saving'),
        defaultMessage: localizeMessage('save_button.save', 'Save'),
        btnClass: 'btn-primary',
        extraClasses: '',
    }

    render() {
        const {saving, disabled, savingMessage, defaultMessage, btnClass, extraClasses, ...props} = this.props; // eslint-disable-line no-use-before-define

        let className = 'save-button btn';
        if (!disabled || saving) {
            className += ' ' + btnClass;
        }

        if (extraClasses) {
            className += ' ' + extraClasses;
        }

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
                    text={savingMessage}
                >
                    {defaultMessage}
                </LoadingWrapper>
            </button>
        );
    }
}
