// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import * as Utils from 'utils/utils.jsx';
import {UploadStatuses} from 'utils/constants';

import LoadingWrapper from 'components/widgets/loading/loading_wrapper';
import SuccessIcon from 'components/widgets/icons/fa_success_icon';

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

        let buttonContent;
        if (status === UploadStatuses.COMPLETE) {
            buttonContent = [
                <SuccessIcon key='icon'/>,
                ' ',
                Utils.localizeMessage('admin.team.uploaded', 'Uploaded!'),
            ];
        } else {
            buttonContent = Utils.localizeMessage('admin.team.upload', 'Upload');
        }

        return (
            <button
                type='button'
                className={primaryClass}
                disabled={disabled}
                onClick={onClick}
                id='upload-button'
            >
                <LoadingWrapper
                    loading={status === UploadStatuses.LOADING}
                    text={Utils.localizeMessage('admin.team.uploading', 'Uploading...')}
                >
                    {buttonContent}
                </LoadingWrapper>
            </button>
        );
    }
}
