// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {changeOpacity, makeStyleFromTheme} from 'mattermost-redux/utils/theme_utils';

import NavigationButton from './navigation_button';

export default class NavigationRow extends React.PureComponent {
    static propTypes = {
        countText: PropTypes.object.isRequired,
        onNextPageButtonClick: PropTypes.func.isRequired,
        onPreviousPageButtonClick: PropTypes.func.isRequired,
        showNextPageButton: PropTypes.bool.isRequired,
        showPreviousPageButton: PropTypes.bool.isRequired,
        theme: PropTypes.object.isRequired,
    };

    renderNextButton = () => {
        return this.props.showNextPageButton ? (
            <NavigationButton
                onClick={this.props.onNextPageButtonClick}
                messageId={'more_channels.next'}
                defaultMessage={'Next'}
            />
        ) : null;
    };

    renderPreviousButton = () => {
        return this.props.showPreviousPageButton ? (
            <NavigationButton
                onClick={this.props.onPreviousPageButtonClick}
                messageId={'more_channels.prev'}
                defaultMessage={'Previous'}
            />
        ) : null;
    };

    render() {
        const style = getStyle(this.props.theme);

        return (
            <div className='navigation-row'>
                <div className='col-xs-2'>
                    {this.renderPreviousButton()}
                </div>
                <div
                    className='col-xs-8 count'
                    style={style.count}
                >
                    {this.props.countText}
                </div>
                <div className='col-xs-2'>
                    {this.renderNextButton()}
                </div>
            </div>
        );
    }
}

const getStyle = makeStyleFromTheme((theme) => {
    return {
        count: {
            color: changeOpacity(theme.centerChannelColor, 0.6),
        },
    };
});
