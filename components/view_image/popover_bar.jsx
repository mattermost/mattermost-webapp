// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class PopoverBar extends React.PureComponent {
    static propTypes = {

        /**
         * Set whether to show this component or not
         */
        show: PropTypes.bool.isRequired,

        /**
         * The index number of the current file.
         */
        fileIndex: PropTypes.number.isRequired,

        /**
         * The count of total files.
         */
        totalFiles: PropTypes.number.isRequired,

        /**
         * The name of current file.
         */
        filename: PropTypes.string.isRequired,

        /**
         * The API route to get current file.
         */
        fileURL: PropTypes.string.isRequired,

        /**
         * Set whether to show "Get Public Link"
         */
        showPublicLink: PropTypes.bool,

        /**
         * Set whether public links are enabled.
         */
        enablePublicLink: PropTypes.bool.isRequired,

        canDownloadFiles: PropTypes.bool.isRequired,

        /**
         * Function to call when click on "Get Public Link"
         */
        onGetPublicLink: PropTypes.func,
    };

    static defaultProps = {
        show: false,
        fileIndex: 0,
        totalFiles: 0,
        filename: '',
        fileURL: '',
        showPublicLink: true,
    };

    render() {
        var publicLink = '';
        if (this.props.enablePublicLink && this.props.showPublicLink) {
            publicLink = (
                <div>
                    <a
                        href='#'
                        className='public-link text'
                        data-title='Public Image'
                        onClick={this.props.onGetPublicLink}
                    >
                        <FormattedMessage
                            id='view_image_popover.publicLink'
                            defaultMessage='Get Public Link'
                        />
                    </a>
                    <span className='text'>{' | '}</span>
                </div>
            );
        }

        var footerClass = 'modal-button-bar';
        if (this.props.show) {
            footerClass += ' footer--show';
        }

        let downloadLinks = null;
        if (this.props.canDownloadFiles) {
            downloadLinks = (
                <div className='image-links'>
                    {publicLink}
                    <a
                        href={this.props.fileURL}
                        download={this.props.filename}
                        className='text'
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        <FormattedMessage
                            id='view_image_popover.download'
                            defaultMessage='Download'
                        />
                    </a>
                </div>
            );
        }

        return (
            <div
                ref='imageFooter'
                className={footerClass}
            >
                <span className='pull-left text'>
                    <FormattedMessage
                        id='view_image_popover.file'
                        defaultMessage='File {count, number} of {total, number}'
                        values={{
                            count: (this.props.fileIndex + 1),
                            total: this.props.totalFiles,
                        }}
                    />
                </span>
                {downloadLinks}
            </div>
        );
    }
}
