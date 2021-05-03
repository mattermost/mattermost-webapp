// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactElement, ReactNode} from 'react';

import SearchableUserList from './searchable_user_list';

type Props = {
    users: Array<Record<string, unknown>>;
    usersPerPage: number;
    total: number;
    extraInfo?: Record<string, unknown>;
    nextPage: (page: number) => void;
    search: (value: string) => void;
    actions?: ReactNode[];
    actionProps?: Record<string, unknown>;
    actionUserProps?: Record<string, unknown>;
    focusOnMount?: boolean;
}

type State = {
    term: string;
    page: number;
}

export default class SearchableUserListContainer extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            term: '',
            page: 0,
        };
    }

    handleTermChange = (term: string): void => {
        this.setState({term});
    }

    nextPage = (): void => {
        this.setState({page: this.state.page + 1});

        this.props.nextPage(this.state.page + 1);
    }

    previousPage = (): void => {
        this.setState({page: this.state.page - 1});
    }

    search = (term: string): void => {
        this.props.search(term);

        if (term !== '') {
            this.setState({page: 0});
        }
    }

    render(): ReactElement {
        return (
            <SearchableUserList
                {...this.props}
                nextPage={this.nextPage}
                previousPage={this.previousPage}
                search={this.search}
                page={this.state.page}
                term={this.state.term}
                onTermChange={this.handleTermChange}
            />
        );
    }
}
