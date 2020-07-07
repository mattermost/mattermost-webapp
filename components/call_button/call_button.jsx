// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {injectIntl} from 'react-intl';

import {intlShape} from 'utils/react_intl';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import AttachmentIcon from 'components/widgets/icons/attachment_icon';

const customStyles = {
    left: 'inherit',
    right: 0,
    bottom: '100%',
    top: 'auto',
};

class CallButton extends PureComponent {
    static propTypes = {
        currentChannel: PropTypes.object.isRequired,
        channelMember: PropTypes.object,
        intl: intlShape.isRequired,
        locale: PropTypes.string.isRequired,
        pluginCallMethods: PropTypes.arrayOf(PropTypes.object),
    };

    static defaultProps = {
        pluginCallMethods: [],
    };

    constructor(props) {
        super(props);
        this.state = {
            menuOpen: false,
        };
    }

    toggleMenu = (open) => {
        this.setState({menuOpen: open});
    }

    render() {
        const {formatMessage} = this.props.intl;

        let bodyAction;

        if (this.props.pluginCallMethods.length === 0) {
            bodyAction = null;
        } else if (this.props.pluginCallMethods.length === 1) {
            const item = this.props.pluginCallMethods[0];
            bodyAction = (
                <div>
                    <button
                        type='button'
                        id='calldButton'
                        className='style--none post-action icon icon--attachment'
                        onClick={() => {
                            if (item.action) {
                                item.action(this.props.currentChannel, this.props.channelMember);
                            }
                        }}
                        onTouchEnd={() => {
                            if (item.action) {
                                item.action(this.props.currentChannel, this.props.channelMember);
                            }
                        }}
                    >
                        {item.icon}
                    </button>
                </div>
            );
        } else {
            const pluginFileUploadMethods = this.props.pluginCallMethods.map((item) => {
                return (
                    <li
                        key={item.pluginId + item.id + '_callbuttonpluginmenuitem'}
                        onClick={() => {
                            if (item.action) {
                                item.action(this.props.currentChannel, this.props.channelMember);
                            }
                            this.setState({menuOpen: false});
                        }}
                    >
                        <a href='#'>
                            <span className='mr-2'>
                                {item.icon}
                            </span>
                            {item.dropdownText}
                        </a>
                    </li>
                );
            });
            bodyAction = (
                <div>
                    <MenuWrapper>
                        <button
                            type='button'
                            className='style--none post-action'
                        >
                            <div
                                id='callButton'
                                className='icon icon--attachment'
                            >
                                <AttachmentIcon className='d-flex'/>
                            </div>
                        </button>
                        <Menu
                            id='callOptions'
                            openLeft={true}
                            openUp={true}
                            ariaLabel={formatMessage({id: 'call_button.menuAriaLabel', defaultMessage: 'Call type selector'})}
                            customStyles={customStyles}
                        >
                            {pluginFileUploadMethods}
                        </Menu>
                    </MenuWrapper>
                </div>
            );
        }

        return (
            <div className={'style--none'}>
                {bodyAction}
            </div>
        );
    }
}

const wrappedComponent = injectIntl(CallButton);
wrappedComponent.displayName = 'injectIntl(CallButton)';
export default wrappedComponent;
