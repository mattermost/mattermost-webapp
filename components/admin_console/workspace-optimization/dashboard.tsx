// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import styled from 'styled-components';
import classNames from 'classnames';

import {getServerVersion} from 'mattermost-redux/selectors/entities/general';
import {GlobalState} from 'mattermost-redux/types/store';

import Accordion, {AccordionItemType} from 'components/common/accordion/accordion';

import {testSiteURL} from '../../../actions/admin_actions';
import FormattedAdminHeader from '../../widgets/admin_console/formatted_admin_header';
import {Props} from '../admin_console';

import useMetricsData from './dashboard.data';

import OverallScore from './overall-score';
import ChipsList, {ChipsInfoType} from './chips_list';

import './dashboard.scss';

type DataModel = {
    [key: string]: {
        title: string;
        description: string;
        items: ItemModel[];
        icon: React.ReactNode;
    };
}

type ItemStatus = 'none' | 'ok' | 'info' | 'warning' | 'error';

type ItemModel = {
    id: string;
    title: string;
    description: string;
    configUrl: string;
    infoUrl: string;
    status: ItemStatus;
}

const getTranslationId = (key: string) => `admin.reporting.workspace_optimization.${key}`;

const AccordionItem = styled.div<{iconColor: string}>`
    padding: 12px;
    border-bottom: 1px solid #BBB;

    &:last-child {
        border-bottom: none;
    }

    h5 {
        display: inline-flex;
        align-items: center;
        font-weight: bold;
    }
`;

const WorkspaceOptimizationDashboard = (props: Props) => {
    const [loading, setLoading] = useState(true);
    const [versionData, setVersionData] = useState<{type: string; version: string; status: ItemStatus}>({type: '', version: '', status: 'none'});
    const {formatMessage} = useIntl();
    const {getAccessData, getConfigurationData, getUpdatesData, getPerformanceData, getSecurityData, getDataPrivacyData, getEaseOfManagementData} = useMetricsData();

    // get the currently installed server version
    const installedVersion = useSelector((state: GlobalState) => getServerVersion(state));
    const analytics = useSelector((state: GlobalState) => state.entities.admin.analytics);
    const {TOTAL_USERS: totalUsers, TOTAL_POSTS: totalPosts} = analytics!;

    // gather locally available data
    const {ServiceSettings} = props.config;
    const {location} = document;

    const sessionLengthWebInDays = ServiceSettings?.SessionLengthWebInDays || -1;

    const testURL = () => {
        const onSuccess = ({status}: any) => {
            data.access.items[0].status = status === 'OK' ? 'none' : 'error';
        };
        const onError = () => {
            data.access.items[0].status = 'error';
        };
        return testSiteURL(onSuccess, onError, location.origin);
    };

    const fetchVersion = async () => {
        // TODO@Michel: replace this with the server API endpoint once the PR got merged
        // @see https://github.com/mattermost/mattermost-server/pull/19366
        const result = await fetch('https://api.github.com/repos/mattermost/mattermost-server/releases/latest').then((result) => result.json());

        if (result.tag_name) {
            const sanitizedVersion = result.tag_name.startsWith('v') ? result.tag_name.slice(1) : result.tag_name;
            const newVersionParts = sanitizedVersion.split('.');
            const installedVersionParts = installedVersion.split('.').slice(0, 3);

            // quick general check if a newer version is available
            let type = '';
            let status: ItemStatus = 'ok';

            if (newVersionParts.join('') > installedVersionParts.join('')) {
                // get correct values to be inserted into the accordion item
                switch (true) {
                case newVersionParts[0] > installedVersionParts[0]:
                    type = formatMessage({
                        id: getTranslationId('updates.server_version.update_type.major'),
                        defaultMessage: 'Major',
                    });
                    status = 'error';
                    break;
                case newVersionParts[1] > installedVersionParts[1]:
                    type = formatMessage({
                        id: getTranslationId('updates.server_version.update_type.minor'),
                        defaultMessage: 'Minor',
                    });
                    status = 'warning';
                    break;
                case newVersionParts[2] > installedVersionParts[2]:
                    type = formatMessage({
                        id: getTranslationId('updates.server_version.update_type.patch'),
                        defaultMessage: 'Patch',
                    });
                    status = 'info';
                    break;
                }
            }

            setVersionData({type, version: result.tag_name, status});
            return;
        }

        const versionIndex = data.updates.items.findIndex((item) => item.id === 'server-version');
        data.updates.items.splice(versionIndex, 1);
    };

    useEffect(() => {
        const promises = [];
        promises.push(testURL());
        promises.push(fetchVersion());
        Promise.all(promises).then(() => setLoading(false));
    }, []);

    const data: DataModel = {
        updates: getUpdatesData({serverVersion: versionData}),
        configuration: getConfigurationData({
            ssl: {status: location.protocol === 'https:' ? 'info' : 'error'},
            sessionLength: {status: sessionLengthWebInDays >= 30 ? 'warning' : 'info'},
        }),
        access: getAccessData({siteUrl: {status: 'info'}}),
        performance: getPerformanceData({
            search: {
                status: totalPosts < 2000000 && totalUsers < 500 ? 'warning' : 'ok',
                totalPosts: totalPosts as number,
                totalUsers: totalUsers as number,
            },
        }),
        security: getSecurityData({loginAttempts: {status: 'warning', count: 24}}),
        dataPrivacy: getDataPrivacyData({retention: {status: 'warning'}}),
        easyManagement: getEaseOfManagementData({ldap: {status: totalUsers > 100 ? 'warning' : 'ok'}, guestAccounts: {status: 'warning'}}),
    };

    const overallScoreChips: ChipsInfoType = {
        info: 0,
        warning: 0,
        error: 0,
    };

    const accData: AccordionItemType[] = Object.entries(data).map(([accordionKey, accordionData]) => {
        const accordionDataChips: ChipsInfoType = {
            info: 0,
            warning: 0,
            error: 0,
        };
        const items: React.ReactNode[] = [];
        accordionData.items.forEach((item) => {
            if (item.status === undefined) {
                return;
            }
            items.push((
                <AccordionItem
                    key={`${accordionKey}-item_${item.id}`}
                    iconColor={item.status}
                >
                    <h5>
                        <i
                            className={classNames(`icon ${item.status}`, {
                                'icon-check-circle-outline': item.status === 'ok',
                                'icon-alert-outline': item.status === 'warning',
                                'icon-alert-circle-outline': item.status === 'error',
                                'icon-information-outline': item.status === 'info',
                            })}
                        />
                        {item.title}
                    </h5>
                    <p>{item.description}</p>
                </AccordionItem>
            ));

            // chips will only be displayed for info aka Success, warning and error aka Problems
            if (item.status && item.status !== 'none' && item.status !== 'ok') {
                accordionDataChips[item.status] += 1;
                overallScoreChips[item.status] += 1;
            }
        });
        const {title, description, icon} = accordionData;
        return {
            title,
            description,
            icon,
            items,
            extraContent: <ChipsList chipsData={accordionDataChips}/>,
        };
    });

    return loading ? <p>{'Loading ...'}</p> : (
        <div className='WorkspaceOptimizationDashboard wrapper--fixed'>
            <FormattedAdminHeader
                id={getTranslationId('title')}
                defaultMessage='Workspace Optimization'
            />
            <div className='admin-console__wrapper'>
                <OverallScore chips={<ChipsList chipsData={overallScoreChips}/>}/>
                <Accordion
                    accordionItemsData={accData}
                    expandMultiple={true}
                />
            </div>
        </div>
    );
};

export default WorkspaceOptimizationDashboard;
