// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {Client4} from 'mattermost-redux/client';
import {t} from 'utils/i18n';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import './commercial_support_modal.scss';

type Props = {

    /**
     * Function that is called when the modal is dismissed
     */
    onHide: () => void;

    show?: boolean;
};

type State = {
    show: boolean;
};

export default class CommercialSupportModal extends React.PureComponent<Props, State> {
    static defaultProps = {
        show: false,
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            show: true,
        };
    }

    doHide = () => {
        this.setState({show: false});
    }

    handleExit = () => {
        this.props.onHide();
    }

    render() {
        return (
            <Modal
                id='commercialSupportModal'
                dialogClassName='a11y__modal more-modal more-direct-channels'
                show={this.state.show}
                onHide={this.doHide}
                onExited={this.handleExit}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        <FormattedMessage
                            id='commercial_support.title'
                            defaultMessage='Commercial Support'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='CommercialSupportModal'>
                        <FormattedMarkdownMessage
                            id='commercial_support.description'
                            defaultMessage={'If you\'re experiencing issues, [submit a support ticket.](!https://support.mattermost.com/hc/en-us/requests/new)\n \n**Download Support Packet**\n \nWe recommend that you download additional environment details about your Mattermost environment to help with troubleshooting. Once downloaded, attach the packet to your support ticket to share with our Customer Support team.'}
                        />
                        <a
                            className='btn btn-primary DownloadSupportPacket'
                            href={`${Client4.getBaseRoute()}/system/generate_support_packet`}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            <FormattedMessage
                                id='commercial_support.download_support_packet'
                                defaultMessage='Download Support Packet'
                            />
                        </a>
                        <div className='alert alert-info DebugLevelNotSet'>
                            <i className='fa  fa-exclamation-circle'/>
                            <FormattedMarkdownMessage
                                id='commercial_support.warning.banner'
                                defaultMessage='Before downloading the support packet, set **Output Logs to File** to **true** and set **File Log Level** to **DEBUG** [here](!/admin_console/environment/logging). Afterwards, please recreate the issue with these settings before submitting.'
                            />
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}
