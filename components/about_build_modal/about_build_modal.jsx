// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';

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
        const mattermostLogo = Constants.MATTERMOST_ICON_SVG;

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
                            <span
                                className='icon'
                                dangerouslySetInnerHTML={{__html: mattermostLogo}}
                            />
                        </div>
                        <div>
                            <h3 className='about-modal__title'>TradersClub</h3>
                            <p className='about-modal__subtitle padding-bottom'>
                                Somos o que há de mais novo para análise de informações do mercado financeiro. De notícias a discussões de operações em tempo real, estamos atentos a tudo que está acontecendo. <br/>
                                As conversas acontecem na presença de especialistas e ninguém fala "economiquês". Tudo de forma simples e direta, justamente para você, que está começando a investir agora. <br/>
                                Além disso, jornalistas de vários veículos também fazem parte da comunidade e postam notícias quentinhas. Assim, você pode ficar esperto antes de dar o próximo passo, seja comprando ou vendendo. 
                            </p>
                        </div>
                    </div>
                    <div className='about-modal__footer'>
                        <div className='form-group about-modal__copyright'>
                            <FormattedMessage
                                id='about.copyright'
                                defaultMessage='Copyright 2016 - {currentYear} TradersClub. Todos os direitos reservados'
                                values={{
                                    currentYear: new Date().getFullYear()
                                }}
                            />
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}
