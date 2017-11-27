// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {localizeMessage} from 'utils/utils.jsx';

export default class SaveButton extends React.PureComponent {
    static propTypes = {
        saving: PropTypes.bool.isRequired,
        disabled: PropTypes.bool,
        savingMessage: PropTypes.string,
        defaultMessage: PropTypes.string
    }

    static defaultProps = {
        disabled: false,
        savingMessage: localizeMessage('save_button.saving', 'Saving'),
        defaultMessage: localizeMessage('save_button.save', 'Save')
    }

    render() {
        const {saving, disabled, savingMessage, defaultMessage, ...props} = this.props; // eslint-disable-line no-use-before-define

        let contents;
        if (saving) {
            contents = (
                <span>
                    <span className='icon fa fa-refresh icon--rotate'/>
                    {savingMessage}
                </span>
            );
        } else {
            contents = defaultMessage;
        }

        let className = 'save-button btn';
        if (!disabled) {
            className += ' btn-primary';
        }

        return (
            <button
                type='submit'
                id='saveSetting'
                className={className}
                disabled={disabled}
                {...props}
            >
                {contents}
            </button>
        );
    }
}
