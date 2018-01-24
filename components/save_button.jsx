// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {localizeMessage} from 'utils/utils.jsx';

export default class SaveButton extends React.PureComponent {
    static propTypes = {
        saving: PropTypes.bool.isRequired,
        disabled: PropTypes.bool,
        type: PropTypes.bool,
        savingMessage: PropTypes.string,
        defaultMessage: PropTypes.string,
        extraClasses: PropTypes.string
    }

    static defaultProps = {
        disabled: false,
        type: 'saveButton',
        savingMessage: localizeMessage('save_button.saving', 'Saving'),
        defaultMessage: localizeMessage('save_button.save', 'Save'),
        extraClasses: ''
    }

    render() {
        const {saving, disabled, savingMessage, defaultMessage, type, extraClasses, ...props} = this.props; // eslint-disable-line no-use-before-define

        let contents;
        if (saving) {
            contents = (
                <span>
                    <span className='fa fa-refresh icon--rotate'/>
                    {savingMessage}
                </span>
            );
        } else {
            contents = defaultMessage;
        }

        let className = 'save-button btn';
        if (!disabled || saving) {
            className += ' btn-primary';
        }

        if (extraClasses) {
            className += ' ' + extraClasses;
        }

        if (type === 'previousButton') {
            className = 'btn btn-link ' + extraClasses;

            return (
                <button
                    type='submit'
                    id='saveSetting'
                    className={className}
                    disabled={disabled}
                    {...props}
                >
                    <i className='fa fa-chevron-left margin-right'/>
                    {contents}
                </button>
            );
        }

        if (type === 'nextButton') {
            className = 'btn btn-link ' + extraClasses;

            return (
                <button
                    type='submit'
                    id='saveSetting'
                    className={className}
                    disabled={disabled}
                    {...props}
                >
                    {contents}
                    <i className='fa fa-chevron-right margin-left'/>
                </button>
            );
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
