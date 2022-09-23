// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {ActionFunc} from 'mattermost-redux/types/actions';
import {ModalIdentifiers} from 'utils/constants';
import Menu from 'components/widgets/menu/menu';
import SchemaInformationModal from 'components/admin_console/events/schema_info_modal';

import LoadingScreen from 'components/loading_screen';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';

import {Topic} from '@mattermost/types/admin';

type Props = {
    topics: Topic[];
    actions: {
        getTopics: () => ActionFunc;
    };
};

type State = {
    loadingTopics: boolean;
};

export default class Topics extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            loadingTopics: false,
        };
    }

    componentDidMount() {
        // this.reload();
    }

    reload = async () => {
        this.setState({loadingTopics: true});
        await this.props.actions.getTopics();
        this.setState({loadingTopics: false});
    }

    render() {
        let content = null;

        if (this.state.loadingTopics || !this.props.topics || this.props.topics.length === 0) {
            content = <LoadingScreen/>;
        } else {
            const tableRows = [];
            for (let i = 0; i < this.props.topics.length; i++) {
                tableRows.push(
                    (<tr key={i}>
                        <td>
                            {this.props.topics[i].topic}
                        </td>
                        <td>
                            {this.props.topics[i].description}
                        </td>
                        <td>
                            {
                                <Menu.ItemToggleModalRedux
                                    id='about'
                                    modalId={ModalIdentifiers.EVENTS_SCHEMA}
                                    dialogType={SchemaInformationModal}
                                    dialogProps={{schema: this.props.topics[i].schema}}
                                    text={''}
                                    icon={<i className='fa fa-info'/>}
                                />
                            }
                        </td>
                    </tr>),
                );
            }
            content = (
                <table
                    className='table table-bordered'
                    cellPadding='5'
                >
                    <tbody>
                        <tr>
                            <th>{'Topic'}</th>
                            <th>{'Description'}</th>
                            <th>{'Schema'}</th>
                        </tr>

                        {tableRows}
                    </tbody>
                </table>
            );
        }

        return (
            <div className='wrapper--admin'>
                <FormattedAdminHeader
                    id='admin.events.title'
                    defaultMessage='Events'
                />

                <div className='admin-console__wrapper'>
                    <div className='admin-logs-content admin-console__content'>
                        {content}
                    </div>
                </div>
            </div>
        );
    }
}

