// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import * as Utils from 'utils/utils.jsx';
import {UploadStatuses} from 'utils/constants.jsx';

export default class UploadButton extends React.PureComponent {
    static propTypes = {

        /*
         * Upload status - loading, complete, default ('')
         */
        status: PropTypes.string,

        /*
         * Primary class of the button
         */
        primaryClass: PropTypes.string,

        /*
         * Disable the button
         */
        disabled: PropTypes.bool,

        /*
         * Funtion to call on button click
         */
        onClick: PropTypes.func,
    }

    render() {
        const {
            status,
            primaryClass,
            disabled,
            onClick,
        } = this.props;

        let buttonIcon;
        let buttonText;

        switch (status) {
        case UploadStatuses.LOADING:
            buttonIcon = (
                <i
                    className='fa fa-refresh icon--rotate'
                    title={Utils.localizeMessage('generic_icons.loading', 'Loading Icon')}
                />
            );
            buttonText = Utils.localizeMessage('admin.team.uploading', 'Uploading..');
            break;
        case UploadStatuses.COMPLETE:
            buttonIcon = (
                <i
                    className='fa fa-check'
                    title={Utils.localizeMessage('generic_icons.success', 'Success Icon')}
                />
            );
            buttonText = Utils.localizeMessage('admin.team.uploaded', 'Uploaded!');
            break;
        default:
            buttonText = Utils.localizeMessage('admin.team.upload', 'Upload');
        }

        return (
            <button
                className={primaryClass}
                disabled={disabled}
                onClick={onClick}
                id='upload-button'
            >
                {buttonIcon}
                {' '}
                {buttonText}
            </button>
        );
    }
}
