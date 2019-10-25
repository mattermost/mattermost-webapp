// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import * as UserAgent from 'utils/user_agent.jsx';

export default class SettingsSidebar extends React.Component {
    constructor(props) {
        super(props);

        this.first = React.createRef();
    }

    handleClick = (tab, e) => {
        e.preventDefault();
        this.props.updateTab(tab.name);
        $(e.target).closest('.settings-modal').addClass('display--content');
    }
    componentDidMount() {
        if (UserAgent.isFirefox()) {
            $('.settings-modal .settings-table .nav').addClass('position--top');
        }
        this.first.current.focus();
    }
    render() {
        const tabList = this.props.tabs.map((tab, i) => {
            const key = `${tab.name}_li`;
            let className = '';
            if (this.props.activeTab === tab.name) {
                className = 'active';
            }

            const buttonProps = {
                id: `${tab.name}Button`,
                className: 'cursor--pointer style--none',
                onClick: this.handleClick.bind(null, tab),
                'aria-label': tab.uiName.toLowerCase(),
            };
            if (i === 0) {
                buttonProps.ref = this.first;
            }

            return (
                <li
                    id={`${tab.name}Li`}
                    key={key}
                    className={className}
                >
                    <button {...buttonProps}>
                        <i
                            className={tab.icon}
                            title={tab.iconTitle}
                        />
                        {tab.uiName}
                    </button>
                </li>
            );
        });

        return (
            <div>
                <ul
                    id='tabList'
                    className='nav nav-pills nav-stacked'
                >
                    {tabList}
                </ul>
            </div>
        );
    }
}

SettingsSidebar.propTypes = {
    tabs: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        uiName: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
    })).isRequired,
    activeTab: PropTypes.string,
    updateTab: PropTypes.func.isRequired,
};
