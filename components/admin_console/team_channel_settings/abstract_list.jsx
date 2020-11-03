// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import NextIcon from 'components/widgets/icons/fa_next_icon';
import PreviousIcon from 'components/widgets/icons/fa_previous_icon';

export const PAGE_SIZE = 10;

export default class AbstractList extends React.PureComponent {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.object),
        onPageChangedCallback: PropTypes.func,
        total: PropTypes.number.isRequired,
        header: PropTypes.node.isRequired,
        renderRow: PropTypes.func.isRequired,
        emptyListTextId: PropTypes.string.isRequired,
        emptyListTextDefaultMessage: PropTypes.string.isRequired,
        actions: PropTypes.shape({
            getData: PropTypes.func.isRequired,
            removeGroup: PropTypes.func,
        }).isRequired,
        noPadding: PropTypes.bool,
    };

    static defaultProps = {
        data: [],
        noPadding: false,
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

    renderHeader = () => {
        if (this.props.data.length > 0) {
            return this.props.header;
        }
        return null;
    }

    renderRows = () => {
        if (this.state.loading) {
            return (
                <div className='groups-list-loading'>
                    <i className='fa fa-spinner fa-pulse fa-2x'/>
                </div>
            );
        }
        if (this.props.data.length === 0) {
            return (
                <div className='groups-list-empty'>
                    <FormattedMessage
                        id={this.props.emptyListTextId}
                        defaultMessage={this.props.emptyListTextDefaultMessage}
                    />
                </div>
            );
        }
        const offset = this.state.page * PAGE_SIZE;
        return this.props.data.slice(offset, offset + PAGE_SIZE).map(this.props.renderRow);
    }

    performSearch = (page) => {
        const newState = {...this.state};
        delete newState.page;

        newState.loading = true;
        this.setState(newState);

        this.props.actions.getData(page, PAGE_SIZE, '', false, true).then((response) => {
            if (this.props.onPageChangedCallback) {
                this.props.onPageChangedCallback(this.getPaging(), response);
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

    render = () => {
        const {startCount, endCount, total} = this.getPaging();
        const {noPadding} = this.props;
        const lastPage = endCount === total;
        const firstPage = this.state.page === 0;
        return (
            <div
                className={classNames(
                    'groups-list',
                    'groups-list-no-padding',
                    {
                        'groups-list-less-padding': noPadding,
                    },
                )}
            >
                {this.renderHeader()}
                <div
                    id='groups-list--body'
                    className='groups-list--body'
                >
                    {this.renderRows()}
                </div>
                {total > 0 && <div className='groups-list--footer'>
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
                        type='button'
                        className={'btn btn-link prev ' + (firstPage ? 'disabled' : '')}
                        onClick={firstPage ? null : this.previousPage}
                        disabled={firstPage}
                    >
                        <PreviousIcon/>
                    </button>
                    <button
                        type='button'
                        className={'btn btn-link next ' + (lastPage ? 'disabled' : '')}
                        onClick={lastPage ? null : this.nextPage}
                        disabled={lastPage}
                        data-testid='page-link-next'
                    >
                        <NextIcon/>
                    </button>
                </div>}
            </div>
        );
    }
}
