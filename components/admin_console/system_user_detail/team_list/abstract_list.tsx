// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {ActionFunc} from 'mattermost-redux/types/actions';

import NextIcon from 'components/widgets/icons/fa_next_icon';
import PreviousIcon from 'components/widgets/icons/fa_previous_icon';

import './abstract_list.scss';

const PAGE_SIZE = 10;

type Props = {
    userId: string;
    headerLabels: Record<string, any>[];
    data: Record<string, any>[];
    onPageChangedCallback?: (paging: Paging) => void;
    total: number;
    renderRow: (item: {[x: string]: string}) => JSX.Element;
    emptyListTextId: string;
    emptyListTextDefaultMessage: string;
    actions: {
        getTeamsData: (userId: string) => ActionFunc & Partial<{then: (func: () => void) => void}> | Promise<Record<string, any>>;
        removeGroup?: () => void;
    };
}

type State = {
    loading: boolean;
    page: number;
}

type Paging = {
    startCount: number;
    endCount: number;
    total: number;
}

export default class AbstractList extends React.PureComponent<Props, State> {
    public static defaultProps = {
        data: [],
    };

    public constructor(props: Props) {
        super(props);
        this.state = {
            loading: true,
            page: 0,
        };
    }

    public componentDidMount() {
        this.performSearch();
    }

    private previousPage = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        e.preventDefault();
        const page = this.state.page < 1 ? 0 : this.state.page - 1;
        this.setState({page, loading: true});
        this.performSearch();
    }

    private nextPage = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        e.preventDefault();
        const page = this.state.page + 1;
        this.setState({page, loading: true});
        this.performSearch();
    }

    private performSearch = (): void => {
        const newState = {...this.state};
        const userId = this.props.userId;
        delete newState.page;

        newState.loading = true;
        this.setState(newState);

        this.props.actions.getTeamsData(userId).then!(() => {
            if (this.props.onPageChangedCallback) {
                this.props.onPageChangedCallback(this.getPaging());
            }
            this.setState({loading: false});
        });
    }

    private getPaging(): Paging {
        const startCount = (this.state.page * PAGE_SIZE) + 1;
        let endCount = (this.state.page * PAGE_SIZE) + PAGE_SIZE;
        const total = this.props.total;
        if (endCount > total) {
            endCount = total;
        }
        return {startCount, endCount, total};
    }

    private renderHeaderLabels = () => {
        if (this.props.data.length > 0) {
            return (
                <div className='AbstractList__header'>
                    {this.props.headerLabels.map((headerLabel, id) => (
                        <div
                            key={id}
                            className='AbstractList__header-label'
                            style={headerLabel.style}
                        >{headerLabel.default}</div>
                    ))}
                </div>
            );
        }
        return null;
    }

    private renderRows = (): JSX.Element | JSX.Element[] => {
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

    public render = (): JSX.Element => {
        const {startCount, endCount, total} = this.getPaging();
        const lastPage = endCount === total;
        const firstPage = this.state.page === 0;
        return (
            <div className='AbstractList'>
                {this.renderHeaderLabels()}
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
                            type='button'
                            className={'btn btn-link prev ' + (firstPage ? 'disabled' : '')}
                            onClick={firstPage ? () => null : this.previousPage}
                            disabled={firstPage}
                        >
                            <PreviousIcon/>
                        </button>
                        <button
                            type='button'
                            className={'btn btn-link next ' + (lastPage ? 'disabled' : '')}
                            onClick={lastPage ? () => null : this.nextPage}
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

