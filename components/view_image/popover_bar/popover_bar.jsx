// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class PopoverBar extends React.PureComponent {
    static propTypes = {
        show: PropTypes.bool.isRequired,
        fileIndex: PropTypes.number.isRequired,
        totalFiles: PropTypes.number.isRequired,
        filename: PropTypes.string.isRequired,
        fileURL: PropTypes.string.isRequired,
        showPublicLink: PropTypes.bool,
        enablePublicLink: PropTypes.bool.isRequired,
        canDownloadFiles: PropTypes.bool.isRequired,
        isExternalFile: PropTypes.bool.isRequired,
        onGetPublicLink: PropTypes.func,
        isDesktopApp: PropTypes.bool.isRequired,
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
            const shouldOpenFile = this.props.isExternalFile && !this.props.isDesktopApp;

            let downloadLinkText;
            const downloadLinkProps = {};
            if (shouldOpenFile) {
                downloadLinkText = (
                    <FormattedMessage
                        id='view_image_popover.open'
                        defaultMessage='Open'
                    />
                );
            } else {
                downloadLinkText = (
                    <FormattedMessage
                        id='view_image_popover.download'
                        defaultMessage='Download'
                    />
                );

                downloadLinkProps.download = this.props.filename;
            }

            downloadLinks = (
                <div className='image-links'>
                    {publicLink}
                    <a
                        href={this.props.fileURL}
                        className='text'
                        target='_blank'
                        rel='noopener noreferrer'
                        {...downloadLinkProps}
                    >
                        {downloadLinkText}
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
