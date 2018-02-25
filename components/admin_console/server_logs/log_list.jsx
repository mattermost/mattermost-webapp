// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

const NEXT_BUTTON_TIMEOUT = 500;

export default class Logs extends React.PureComponent {
    static propTypes = {

        /*
         * Array of logs to render
         */
        logs: PropTypes.arrayOf(PropTypes.string).isRequired,
        page: PropTypes.number.isRequired,
        perPage: PropTypes.number.isRequired,
        nextPage: PropTypes.func.isRequired,
        previousPage: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.nextPage = this.nextPage.bind(this);
        this.previousPage = this.previousPage.bind(this);
        this.state = {
            nextDisabled: false,
        };
    }

    componentDidMount() {
        // Scroll Down to get the latest logs
        var node = this.refs.logPanel;
        node.scrollTop = node.scrollHeight;
        node.focus();
    }

    componentDidUpdate() {
        // Scroll Down to get the latest logs
        var node = this.refs.logPanel;
        node.scrollTop = node.scrollHeight;
        node.focus();
    }

    nextPage(e) {
        e.preventDefault();

        this.setState({nextDisabled: true});
        this.nextTimeoutId = setTimeout(() => this.setState({nextDisabled: false}), NEXT_BUTTON_TIMEOUT);

        this.props.nextPage();
    }

    previousPage(e) {
        e.preventDefault();

        this.props.previousPage();
    }

    render() {
        let content = null;
        let nextButton;
        let previousButton;

        if (this.props.logs.length >= this.props.perPage) {
            nextButton = (
                <button
                    className='btn btn-default filter-control filter-control__next pull-right'
                    onClick={this.nextPage}
                    disabled={this.state.nextDisabled}
                >
                    <FormattedMessage
                        id='admin.logs.next'
                        defaultMessage='Next'
                    />
                    <i className='fa fa-chevron-right margin-left'/>
                </button>
            );
        }

        if (this.props.page > 0) {
            previousButton = (
                <button
                    className='btn btn-default filter-control filter-control__prev'
                    onClick={this.previousPage}
                >
                    <i className='fa fa-angle-left'/>
                    <FormattedMessage
                        id='admin.logs.prev'
                        defaultMessage='Previous'
                    />
                </button>
            );
        }

        content = [];

        for (let i = 0; i < this.props.logs.length; i++) {
            const style = {
                whiteSpace: 'nowrap',
                fontFamily: 'monospace',
            };

            if (this.props.logs[i].indexOf('[EROR]') > 0) {
                style.color = 'red';
            }

            content.push(<br key={'br_' + i}/>);
            content.push(
                <span
                    key={'log_' + i}
                    style={style}
                >
                    {this.props.logs[i]}
                </span>
            );
        }

        return (
            <div>
                <div
                    tabIndex='-1'
                    ref='logPanel'
                    className='log__panel'
                >
                    {content}
                </div>
                <div className='padding-top padding-bottom x2 filter-controls'>
                    {previousButton}
                    {nextButton}
                </div>
            </div>
        );
    }
}
