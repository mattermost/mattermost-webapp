// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import NextIcon from 'components/widgets/icons/fa_next_icon';
import PreviousIcon from 'components/widgets/icons/fa_previous_icon';

import './abstract_list.scss';

const PAGE_SIZE = 10;

export default class AbstractList extends React.PureComponent {
    static propTypes = {
        userId: PropTypes.string.isRequired,
        headerLabels: PropTypes.array.isRequired,
        data: PropTypes.arrayOf(PropTypes.object),
        onPageChangedCallback: PropTypes.func,
        total: PropTypes.number.isRequired,
        renderRow: PropTypes.func.isRequired,
        emptyListTextId: PropTypes.string.isRequired,
        emptyListTextDefaultMessage: PropTypes.string.isRequired,
        actions: PropTypes.shape({
            getTeamsData: PropTypes.func.isRequired,
            removeGroup: PropTypes.func,
        }).isRequired,
    };

    static defaultProps = {
        data: [],
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            page: 0,
        };
    }

    componentDidMount() {
        this.performSearch(this.state.page);
    }

    previousPage = async (e) => {
        e.preventDefault();
        const page = this.state.page < 1 ? 0 : this.state.page - 1;
        this.setState({page, loading: true});
        this.performSearch(page);
    }

    nextPage = async (e) => {
        e.preventDefault();
        const page = this.state.page + 1;
        this.setState({page, loading: true});
        this.performSearch(page);
    }

    performSearch = () => {
        const newState = {...this.state};
        const userId = this.props.userId;
        delete newState.page;

        newState.loading = true;
        this.setState(newState);

        this.props.actions.getTeamsData(userId).then(() => {
            if (this.props.onPageChangedCallback) {
                this.props.onPageChangedCallback(this.getPaging());
            }
            this.setState({loading: false});
        });
    }

    getPaging() {
        const startCount = (this.state.page * PAGE_SIZE) + 1;
        let endCount = (this.state.page * PAGE_SIZE) + PAGE_SIZE;
        const total = this.props.total;
        if (endCount > total) {
            endCount = total;
        }
        return {startCount, endCount, total};
    }

    renderHeaderLabels = () => {
        return (
            <React.Fragment>
                {this.props.headerLabels.map((headerLabel, id) => (
                    <div
                        key={id}
                        className='AbstractList__header-label'
                        style={headerLabel.style}
                    >{headerLabel.default}</div>
                ))}
            </React.Fragment>
        );
    }

    renderRows = () => {
        if (this.state.loading) {
            return (
                <div className='AbstractList__loading'>
                    <i className='fa fa-spinner fa-pulse fa-2x'/>
                </div>
            );
        }
        if (this.props.data.length === 0) {
            return (
                <div className='AbstractList__empty'>
                    <FormattedMessage
                        id={this.props.emptyListTextId}
                        defaultMessage={this.props.emptyListTextDefaultMessage}
                    />
                </div>
            );
        }
        const pageStart = this.state.page < 1 ? 0 : (this.state.page * PAGE_SIZE); // ie 0, 10, 20, etc.
        const pageEnd = this.state.page < 1 ? PAGE_SIZE : (this.state.page + 1) * PAGE_SIZE; // ie 10, 20, 30, etc.
        const pageData = this.props.data.slice(pageStart, pageEnd).map(this.props.renderRow); // ie 0-10, 10-20, etc.
        return pageData;
    }

    render = () => {
        const {startCount, endCount, total} = this.getPaging();
        const lastPage = endCount === total;
        const firstPage = this.state.page === 0;
        return (
            <div className='AbstractList'>
                <div className='AbstractList__header'>
                    {this.renderHeaderLabels()}
                </div>
                <div className='AbstractList__body'>
                    {this.renderRows()}
                </div>
                {total > 0 &&
                    <div className='AbstractList__footer'>
                        <div className='counter'>
                            <FormattedMessage
                                id='admin.team_channel_settings.list.paginatorCount'
                                defaultMessage='{startCount, number} - {endCount, number} of {total, number}'
                                values={{
                                    startCount,
                                    endCount,
                                    total,
                                }}
                            />
                        </div>
                        <button
                            className={'btn btn-link prev ' + (firstPage ? 'disabled' : '')}
                            onClick={firstPage ? null : this.previousPage}
                            disabled={firstPage}
                        >
                            <PreviousIcon/>
                        </button>
                        <button
                            className={'btn btn-link next ' + (lastPage ? 'disabled' : '')}
                            onClick={lastPage ? null : this.nextPage}
                            disabled={lastPage}
                        >
                            <NextIcon/>
                        </button>
                    </div>
                }
            </div>
        );
    }
}

