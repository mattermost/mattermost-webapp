// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import MattermostLogo from 'components/widgets/icons/mattermost_logo';
import Nbsp from 'components/html_entities/nbsp';

import {AboutLinks} from 'utils/constants';

import './about_build_modal_cloud.scss';

type Props = {

    /**
     * Function that is called when the modal is dismissed
     */
    onHide: () => void;

    /**
     * Global config object
     */
    config: any;

    /**
     * Global license object
     */
    license: any;

    /**
     * Webapp build hash override. By default, webpack sets this (so it must be overridden in tests).
     */
    webappBuildHash: string;

    show: boolean;
};

export default function AboutBuildModalCloud(props: Props) {
    const doHide = () => {

    };

    const handleExit = () => {
        props.onHide();
    };

    const config = props.config;
    const license = props.license;
    const isCloud = license.Cloud === 'true';

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

    let licensee;
    if (isCloud) {
        title = (
            <FormattedMessage
                id='about.cloudEdition'
                defaultMessage='Cloud'
            />
        );

        subTitle = (
            <FormattedMessage
                id='about.enterpriseEditionSst'
                defaultMessage='High trust messaging for the enterprise'
            />
        );

        licensee = (
            <div className='form-group'>
                <FormattedMessage
                    id='about.licensed'
                    defaultMessage='Licensed to:'
                />
                <Nbsp/>
                {license.Company}
            </div>
        );
    }

    let mmversion = config.BuildNumber;
    if (!isNaN(config.BuildNumber)) {
        mmversion = 'ci';
    }

    return (
        <Modal
            dialogClassName={classNames('a11y__modal', 'about-modal', 'cloud')}
            show={props.show}
            onHide={doHide}
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
