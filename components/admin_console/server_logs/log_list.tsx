// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import NextIcon from 'components/widgets/icons/fa_next_icon';

const NEXT_BUTTON_TIMEOUT = 500;

type Props = {
    logs: string[];
    page: number;
    perPage: number;
    nextPage: () => void;
    previousPage: () => void;
};

type State = {
    nextDisabled: boolean;
};

export default class Logs extends React.PureComponent<Props, State> {
    private logPanel: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);

        this.logPanel = React.createRef();

        this.state = {
            nextDisabled: false,
        };
    }

    componentDidMount() {
        // Scroll Down to get the latest logs
        const node = this.logPanel.current;
        if (node) {
            node.scrollTop = node.scrollHeight;
            node.focus();
        }
    }

    componentDidUpdate() {
        // Scroll Down to get the latest logs
        const node = this.logPanel.current;
        if (node) {
            node.scrollTop = node.scrollHeight;
        }
    }

    nextPage = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        this.setState({nextDisabled: true});
        setTimeout(() => this.setState({nextDisabled: false}), NEXT_BUTTON_TIMEOUT);

        this.props.nextPage();
    }

    previousPage = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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
                    type='button'
                    className='btn btn-default filter-control filter-control__next pull-right'
                    onClick={this.nextPage}
                    disabled={this.state.nextDisabled}
                >
                    <FormattedMessage
                        id='admin.logs.next'
                        defaultMessage='Next'
                    />
                    <NextIcon additionalClassName='ml-2'/>
                </button>
            );
        }

        if (this.props.page > 0) {
            previousButton = (
                <button
                    type='button'
                    className='btn btn-default filter-control filter-control__prev'
                    onClick={this.previousPage}
                >
                    <FormattedMessage
                        id='generic_icons.previous'
                        defaultMessage='Previous Icon'
                    >
                        {(title: string) => (
                            <i
                                className='fa fa-angle-left'
                                title={title}
                            />
                        )}
                    </FormattedMessage>
                    <FormattedMessage
                        id='admin.logs.prev'
                        defaultMessage='Previous'
                    />
                </button>
            );
        }

        content = [];

        for (let i = 0; i < this.props.logs.length; i++) {
            const style: React.CSSProperties = {
                whiteSpace: 'nowrap',
                fontFamily: 'monospace',
                color: '',
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
                </span>,
            );
        }

        return (
            <div>
                <div
                    tabIndex={-1}
                    ref={this.logPanel}
                    className='log__panel'
                >
                    {content}
                </div>
                <div className='pt-3 pb-3 filter-controls'>
                    {previousButton}
                    {nextButton}
                </div>
            </div>
        );
    }
}
