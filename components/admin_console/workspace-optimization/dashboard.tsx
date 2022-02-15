// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import styled from 'styled-components';
import classNames from 'classnames';

import {CheckIcon} from '@mattermost/compass-icons/components';

import {getServerVersion} from 'mattermost-redux/selectors/entities/general';
import {GlobalState} from 'mattermost-redux/types/store';

import Accordion, {AccordionItemType} from 'components/common/accordion/accordion';

import {testSiteURL} from '../../../actions/admin_actions';
import LoadingScreen from '../../loading_screen';
import FormattedAdminHeader from '../../widgets/admin_console/formatted_admin_header';
import {Props} from '../admin_console';

import useMetricsData, {DataModel, ItemStatus} from './dashboard.data';
import OverallScore from './overall-score';
import ChipsList, {ChipsInfoType} from './chips_list';
import CtaButtons from './cta_buttons';

import './dashboard.scss';

const AccordionItem = styled.div`
    padding: 12px;
    &:last-child {
        border-bottom: none;
    }
    h5 {
        display: inline-flex;
        align-items: center;
        font-weight: bold;
    }
`;

const successIcon = (
    <div className='success'>
        <CheckIcon
            size={20}
            color={'var(--sys-online-indicator)'}
        />
    </div>
);

const WorkspaceOptimizationDashboard = (props: Props) => {
    const [loading, setLoading] = useState(true);
    const [versionData, setVersionData] = useState<{type: string; version: string; status: ItemStatus}>({type: '', version: '', status: 'none'});
    const [guestAccountStatus, setGuestAccountStatus] = useState<ItemStatus>('none');
    const [liveUrlStatus, setLiveUrlStatus] = useState<ItemStatus>('none');
    const {formatMessage} = useIntl();
    const {getAccessData, getConfigurationData, getUpdatesData, getPerformanceData, getDataPrivacyData, getEaseOfManagementData} = useMetricsData();

    // get the currently installed server version
    const installedVersion = useSelector((state: GlobalState) => getServerVersion(state));
    const analytics = useSelector((state: GlobalState) => state.entities.admin.analytics);
    const {TOTAL_USERS: totalUsers, TOTAL_POSTS: totalPosts} = analytics!;

    // gather locally available data
    const {ServiceSettings, DataRetentionSettings, TeamSettings, GuestAccountsSettings} = props.config;
    const {location} = document;

    const sessionLengthWebInDays = ServiceSettings?.SessionLengthWebInDays || -1;
    const dataRetentionEnabled = DataRetentionSettings?.EnableMessageDeletion || DataRetentionSettings?.EnableFileDeletion;

    const testURL = () => {
        const onSuccess = ({status}: any) => setLiveUrlStatus(status === 'OK' ? 'ok' : 'error');
        const onError = () => setLiveUrlStatus('error');
        return testSiteURL(onSuccess, onError, location.origin);
    };

    const fetchVersion = async () => {
        const result = await fetch('/api/v4/latest_version').then((result) => result.json());

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
                        id: 'admin.reporting.workspace_optimization.updates.server_version.update_type.major',
                        defaultMessage: 'Major',
                    });
                    status = 'error';
                    break;
                case newVersionParts[1] > installedVersionParts[1]:
                    type = formatMessage({
                        id: 'admin.reporting.workspace_optimization.updates.server_version.update_type.minor',
                        defaultMessage: 'Minor',
                    });
                    status = 'warning';
                    break;
                case newVersionParts[2] > installedVersionParts[2]:
                    type = formatMessage({
                        id: 'admin.reporting.workspace_optimization.updates.server_version.update_type.patch',
                        defaultMessage: 'Patch',
                    });
                    status = 'info';
                    break;
                }
            }

            setVersionData({type, version: result.tag_name, status});
        }
    };

    const fetchGuestAccounts = async () => {
        if (TeamSettings?.EnableOpenServer && GuestAccountsSettings?.Enable) {
            let usersArray = await fetch('/api/v4/users/invalid_emails').then((result) => result.json());

            // this setting is just a string with a list of domains, or an empty string
            if (GuestAccountsSettings?.RestrictCreationToDomains) {
                const domainList = GuestAccountsSettings?.RestrictCreationToDomains;
                usersArray = usersArray.filter(({email}: Record<string, unknown>) => domainList.includes((email as string).split('@')[1]));
            }

            // if guest accounts make up more than 5% of the user base show the info accordion
            if (usersArray.length > (totalUsers as number * 0.05)) {
                setGuestAccountStatus('info');
                return;
            }
        }

        setGuestAccountStatus('ok');
    };

    useEffect(() => {
        const promises = [];
        promises.push(testURL());
        promises.push(fetchVersion());
        promises.push(fetchGuestAccounts());
        Promise.all(promises).then(() => setLoading(false));
    }, []);

    const data: DataModel = {
        updates: getUpdatesData({serverVersion: versionData}),
        configuration: getConfigurationData({
            ssl: {status: location.protocol === 'https:' ? 'ok' : 'error'},
            sessionLength: {status: sessionLengthWebInDays >= 30 ? 'info' : 'ok'},
        }),
        access: getAccessData({siteUrl: {status: liveUrlStatus}}),
        performance: getPerformanceData({
            search: {
                status: totalPosts < 2_000_000 && totalUsers < 500 ? 'ok' : 'info',
            },
        }),
        dataPrivacy: getDataPrivacyData({retention: {status: dataRetentionEnabled ? 'ok' : 'info'}}),
        easyManagement: getEaseOfManagementData({
            ldap: {status: totalUsers > 500 ? 'info' : 'ok'},
            guestAccounts: {status: guestAccountStatus},
        }),
    };

    const learnMoreText = formatMessage({id: 'benefits_trial.modal.learnMore', defaultMessage: 'Learn More'});

    const overallScoreChips: ChipsInfoType = {
        info: 0,
        warning: 0,
        error: 0,
    };

    const overallScore = {
        max: 0,
        current: 0,
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

            // add the items impact to the overall score here
            overallScore.max += item.scoreImpact;
            overallScore.current += item.scoreImpact * item.impactModifier;

            // chips will only be displayed for info aka Success, warning and error aka Problems
            if (item.status && item.status !== 'none' && item.status !== 'ok') {
                items.push((
                    <AccordionItem
                        key={`${accordionKey}-item_${item.id}`}
                    >
                        <h5>
                            <i
                                className={classNames(`icon ${item.status}`, {
                                    'icon-alert-outline': item.status === 'warning',
                                    'icon-alert-circle-outline': item.status === 'error',
                                    'icon-information-outline': item.status === 'info',
                                })}
                            />
                            {item.title}
                        </h5>
                        <p>{item.description}</p>
                        <CtaButtons
                            learnMoreLink={item.infoUrl}
                            learnMoreText={learnMoreText}
                            actionLink={item.configUrl}
                            actionText={item.configText}
                        />
                    </AccordionItem>
                ));

                accordionDataChips[item.status] += 1;
                overallScoreChips[item.status] += 1;
            }
        });
        const {title, description, descriptionOk, icon} = accordionData;
        return {
            title,
            description: items.length === 0 ? descriptionOk : description,
            icon: items.length === 0 ? successIcon : icon,
            items,
            extraContent: (
                <ChipsList
                    chipsData={accordionDataChips}
                    hideCountZeroChips={true}
                />
            ),
        };
    });

    return loading ? <LoadingScreen/> : (
        <div className='WorkspaceOptimizationDashboard wrapper--fixed'>
            <FormattedAdminHeader
                id={'admin.reporting.workspace_optimization.title'}
                defaultMessage='Workspace Optimization'
            />
            <div className='admin-console__wrapper'>
                <OverallScore
                    chips={
                        <ChipsList
                            chipsData={overallScoreChips}
                            hideCountZeroChips={false}
                        />
                    }
                    chartValue={Math.floor((overallScore.current / overallScore.max) * 100)}
                />
                <Accordion
                    accordionItemsData={accData}
                    expandMultiple={true}
                />
            </div>
        </div>
    );
};

export default WorkspaceOptimizationDashboard;
