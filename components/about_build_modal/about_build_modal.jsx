// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';

import MattermostLogo from 'components/svg/mattermost_logo';

export default class AboutBuildModal extends React.PureComponent {
    static defaultProps = {
        show: false
    };

    static propTypes = {

        /**
         * Determines whether modal is shown or not
         */
        show: PropTypes.bool.isRequired,

        /**
         * Function that is called when the modal is dismissed
         */
        onModalDismissed: PropTypes.func.isRequired,

        /**
         * Global config object
         */
        config: PropTypes.object.isRequired,

        /**
         * Global license object
         */
        license: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.doHide = this.doHide.bind(this);
    }

    doHide() {
        this.props.onModalDismissed();
    }

    render() {
        const config = this.props.config;
        const license = this.props.license;

        let title = (
            <FormattedMessage
                id='about.teamEditiont0'
                defaultMessage='Team Edition'
            />
        );

        let subTitle = (
            <FormattedMessage
                id='about.teamEditionSt'
                defaultMessage='All your team communication in one place, instantly searchable and accessible anywhere.'
            />
        );

        let learnMore = (
            <div>
                <FormattedMessage
                    id='about.teamEditionLearn'
                    defaultMessage='Join the Mattermost community at '
                />
                <a
                    target='_blank'
                    rel='noopener noreferrer'
                    href='http://www.mattermost.org/'
                >
                    {'mattermost.org'}
                </a>
            </div>
        );

        let licensee;
        if (config.BuildEnterpriseReady === 'true') {
            title = (
                <FormattedMessage
                    id='about.teamEditiont1'
                    defaultMessage='Enterprise Edition'
                />
            );

            subTitle = (
                <FormattedMessage
                    id='about.enterpriseEditionSt'
                    defaultMessage='Modern communication from behind your firewall.'
                />
            );

            learnMore = (
                <div>
                    <FormattedMessage
                        id='about.enterpriseEditionLearn'
                        defaultMessage='Learn more about Enterprise Edition at '
                    />
                    <a
                        target='_blank'
                        rel='noopener noreferrer'
                        href='http://about.mattermost.com/'
                    >
                        {'about.mattermost.com'}
                    </a>
                </div>
            );

            if (license.IsLicensed === 'true') {
                title = (
                    <FormattedMessage
                        id='about.enterpriseEditione1'
                        defaultMessage='Enterprise Edition'
                    />
                );
                licensee = (
                    <div className='form-group'>
                        <FormattedMessage
                            id='about.licensed'
                            defaultMessage='Licensed to:'
                        />
                        &nbsp;{license.Company}
                    </div>
                );
            }
        }

        let version = '\u00a0' + config.Version;
        if (config.BuildNumber !== config.Version) {
            version += '\u00a0 (' + config.BuildNumber + ')';
        }

        return (
            <Modal
                dialogClassName='about-modal'
                show={this.props.show}
                onHide={this.doHide}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        <FormattedMessage
                            id='about.title'
                            defaultMessage='About Mattermost'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='about-modal__content'>
                        <div className='about-modal__logo'>
                            <MattermostLogo/>
                        </div>
                        <div>
                            <h3 className='about-modal__title'>{'Mattermost'} {title}</h3>
                            <p className='about-modal__subtitle padding-bottom'>{subTitle}</p>
                            <div className='form-group less'>
                                <div>
                                    <FormattedMessage
                                        id='about.version'
                                        defaultMessage='Version:'
                                    />
                                    <span id='versionString'>{version}</span>
                                </div>
                                <div>
                                    <FormattedMessage
                                        id='about.database'
                                        defaultMessage='Database:'
                                    />
                                    {'\u00a0' + config.SQLDriverName}
                                </div>
                            </div>
                            {licensee}
                        </div>
                    </div>
                    <div className='about-modal__footer'>
                        {learnMore}
                        <div className='form-group about-modal__copyright'>
                            <FormattedMessage
                                id='about.copyright'
                                defaultMessage='Copyright 2015 - {currentYear} Mattermost, Inc. All rights reserved'
                                values={{
                                    currentYear: new Date().getFullYear()
                                }}
                            />
                        </div>
                    </div>
                    <div className='about-modal__notice form-group padding-top x2'>
                        <p>
                            <FormattedHTMLMessage
                                id='about.notice'
                                defaultMessage='Mattermost is made possible by the open source software used in our <a href="https://about.mattermost.com/platform-notice-txt/" target="_blank">platform</a>, <a href="https://about.mattermost.com/desktop-notice-txt/" target="_blank">desktop</a> and <a href="https://about.mattermost.com/mobile-notice-txt/" target="_blank">mobile</a> apps.'
                            />
                        </p>
                    </div>
                    <div className='about-modal__hash'>
                        <p>
                            <FormattedMessage
                                id='about.hash'
                                defaultMessage='Build Hash:'
                            />
                            &nbsp;{config.BuildHash}
                            <br/>
                            <FormattedMessage
                                id='about.hashee'
                                defaultMessage='EE Build Hash:'
                            />
                            &nbsp;{config.BuildHashEnterprise}
                        </p>
                        <p>
                            <FormattedMessage
                                id='about.date'
                                defaultMessage='Build Date:'
                            />
                            &nbsp;{config.BuildDate}
                        </p>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}
