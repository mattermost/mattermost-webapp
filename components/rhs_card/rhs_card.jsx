// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';

import Constants from 'utils/constants.jsx';
import DelayedAction from 'utils/delayed_action.jsx';
import * as Utils from 'utils/utils.jsx';
import SearchResultsHeader from 'components/search_results_header';
import Markdown from 'components/markdown';

export function renderView(props) {
    return (
        <div
            {...props}
            className='scrollbar--view'
        />);
}

export function renderThumbHorizontal(props) {
    return (
        <div
            {...props}
            className='scrollbar--horizontal'
        />);
}

export function renderThumbVertical(props) {
    return (
        <div
            {...props}
            className='scrollbar--vertical'
        />);
}

export default class RhsCard extends React.Component {
    static propTypes = {
        selected: PropTypes.object,
        pluginPostCardTypes: PropTypes.object,
    }

    static defaultProps = {
        pluginPostCardTypes: {},
    }

    constructor(props) {
        super(props);

        this.scrollStopAction = new DelayedAction(this.handleScrollStop);

        this.state = {
            isScrolling: false,
            topRhsPostCreateAt: 0,
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!Utils.areObjectsEqual(nextState.selected, this.props.selected)) {
            return true;
        }
        if (nextState.isScrolling !== this.state.isScrolling) {
            return true;
        }
        return false;
    }

    handleScroll = () => {
        if (!this.state.isScrolling) {
            this.setState({
                isScrolling: true,
            });
        }

        this.scrollStopAction.fireAfter(Constants.SCROLL_DELAY);
    }

    handleScrollStop = () => {
        this.setState({
            isScrolling: false,
        });
    }

    getSidebarBody = () => {
        return this.refs.sidebarbody;
    }

    render() {
        if (this.props.selected == null) {
            return (<div/>);
        }

        const {selected, pluginPostCardTypes} = this.props;
        const postType = selected.type;
        let content = null;
        if (pluginPostCardTypes.hasOwnProperty(postType)) {
            const PluginComponent = pluginPostCardTypes[postType].component;
            content = <PluginComponent post={selected}/>;
        }

        if (!content) {
            content = (
                <div className='card'>
                    <Markdown message={selected.props && selected.props.card}/>
                </div>
            );
        }

        return (
            <div
                className='sidebar-right__body'
                ref='sidebarbody'
            >
                <SearchResultsHeader
                    isCard={true}
                    channelDisplayName={'not-used'}
                />
                <Scrollbars
                    autoHide={true}
                    autoHideTimeout={500}
                    autoHideDuration={500}
                    renderThumbHorizontal={renderThumbHorizontal}
                    renderThumbVertical={renderThumbVertical}
                    renderView={renderView}
                    onScroll={this.handleScroll}
                >
                    <div className='post-right__scroll'>
                        {content}
                    </div>
                </Scrollbars>
            </div>
        );
    }
}
