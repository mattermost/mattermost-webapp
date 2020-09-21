// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import MattermostLogo from 'components/widgets/icons/mattermost_logo';

import './about_build_modal_cloud.scss';

type Props = {
    onHide: () => void;
    config: any;
    license: any;
    show: boolean;
    doHide: () => void;
};

export default function AboutBuildModalCloud(props: Props) {
    const handleExit = () => {
        props.onHide();
    };

    const config = props.config;
    const license = props.license;

    const title = (
        <FormattedMessage
            id='about.cloudEdition'
            defaultMessage='Cloud'
        />
    );

    const subTitle = (
        <FormattedMessage
            id='about.enterpriseEditionSst'
            defaultMessage='High trust messaging for the enterprise'
        />
    );

    const licensee = (
        <div className='form-group'>
            <FormattedMessage
                id='about.licensed'
                defaultMessage='Licensed to:'
            />
            {'\u00a0' + license.Company}
        </div>
    );

    let mmversion = config.BuildNumber;
    if (!isNaN(config.BuildNumber)) {
        mmversion = 'ci';
    }

    return (
        <Modal
            dialogClassName={classNames('a11y__modal', 'about-modal', 'cloud')}
            show={props.show}
            onHide={props.doHide}
            onExited={handleExit}
            role='dialog'
            aria-labelledby='aboutModalLabel'
        >
            <Modal.Header closeButton={true}>
                <Modal.Title
                    componentClass='h1'
                    id='aboutModalLabel'
                >
                    <FormattedMessage
                        id='about.title'
                        values={{appTitle: config.SiteName || 'Mattermost'}}
                        defaultMessage='About {appTitle}'
                    />
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='about-modal__content'>
                    <div className='about-modal__logo'>
                        <MattermostLogo/>
                    </div>
                    <div>
                        <h3 className='about-modal__title'>
                            {'Mattermost'} {title}
                        </h3>
                        <p className='subtitle'>{subTitle}</p>
                        <div className='description'>
                            <div>
                                <FormattedMessage
                                    id='about.version'
                                    defaultMessage='Mattermost Version:'
                                />
                                <span id='versionString'>{'\u00a0' + mmversion}</span>
                            </div>
                        </div>
                        {licensee}
                        <div className='about-footer'>
                            <FormattedMarkdownMessage
                                id='about.notice'
                                defaultMessage='Mattermost is made possible by the open source software used in our [server](!https://about.mattermost.com/platform-notice-txt/), [desktop](!https://about.mattermost.com/desktop-notice-txt/) and [mobile](!https://about.mattermost.com/mobile-notice-txt/) apps.'
                            />
                            <div className='copy-right'>
                                <FormattedMessage
                                    id='about.copyright'
                                    defaultMessage='Copyright 2015 - {currentYear} Mattermost, Inc. All rights reserved'
                                    values={{
                                        currentYear: new Date().getFullYear(),
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div/>
                </div>
            </Modal.Body>
        </Modal>
    );
}
