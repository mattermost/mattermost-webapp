// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {trackEvent} from 'actions/telemetry_actions.jsx';
import Markdown from 'components/markdown';

import alertIcon from 'images/icons/round-white-info-icon.svg';

import AnnouncementBar from './default_announcement_bar';

const localStoragePrefix = '__announcement__';

export default class TextDismissableBar extends React.PureComponent {
    static propTypes = {
        allowDismissal: PropTypes.bool.isRequired,
        text: PropTypes.string.isRequired,
        onDismissal: PropTypes.func,

        // Any props that AnnouncementBar supports
    };

    constructor(props) {
        super(props);

        this.state = {
            dismissed: true,
        };
    }

    static getDerivedStateFromProps(props) {
        const dismissed = localStorage.getItem(localStoragePrefix + props.text);
        return {
            dismissed,
        };
    }

    handleDismiss = () => {
        if (!this.props.allowDismissal) {
            return;
        }
        trackEvent('signup', 'click_dismiss_bar');

        localStorage.setItem(localStoragePrefix + this.props.text, true);
        this.setState({
            dismissed: true,
        });
        if (this.props.onDismissal) {
            this.props.onDismissal();
        }
    }

    render() {
        if (this.state.dismissed) {
            return null;
        }
        const {allowDismissal, text, ...extraProps} = this.props;
        return (
            <AnnouncementBar
                {...extraProps}
                showCloseButton={allowDismissal}
                handleClose={this.handleDismiss}
                message={
                    <>
                        <img
                            className='advisor-icon'
                            src={alertIcon}
                        />
                        <Markdown
                            message={text}
                            options={{
                                singleline: true,
                                mentionHighlight: false,
                            }}
                        />
                    </>
                }
            />
        );
    }
}

