// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {Tooltip} from 'react-bootstrap';

import {useDispatch, useSelector} from 'react-redux';
import {PreferenceType} from 'mattermost-redux/types/preferences';

import {getStandardAnalytics} from 'mattermost-redux/actions/admin';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';

import {GlobalState} from 'types/store';
import AlertBanner from 'components/alert_banner';
import DropdownInput from 'components/dropdown_input';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import OverlayTrigger from 'components/overlay_trigger';
import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';

import {Preferences, CloudBanners} from 'utils/constants';

import privateCloudImage from 'images/private-cloud-image.svg';
import upgradeMattermostCloudImage from 'images/upgrade-mattermost-cloud-image.svg';

import './billing_subscriptions.scss';
import BillingSummary from './billing_summary';

const upgradeMattermostCloud = () => (
    <div className='UpgradeMattermostCloud'>
        <div className='UpgradeMattermostCloud__image'>
            <img src={upgradeMattermostCloudImage}/>
        </div>
        <div className='UpgradeMattermostCloud__title'>
            <FormattedMessage
                id='admin.billing.subscription.upgradeMattermostCloud.title'
                defaultMessage='Need more users?'
            />
        </div>
        <div className='UpgradeMattermostCloud__description'>
            <FormattedMarkdownMessage
                id='admin.billing.subscription.upgradeMattermostCloud.description'
                defaultMessage='The free tier is **limited to 10 users.** Get access to more users, teams and other great features'
            />
        </div>
        <button className='UpgradeMattermostCloud__upgradeButton'>
            <FormattedMessage
                id='admin.billing.subscription.upgradeMattermostCloud.upgradeButton'
                defaultMessage='Upgrade Mattermost Cloud'
            />
        </button>
    </div>
);

const privateCloudCard = () => (
    <div className='PrivateCloudCard'>
        <div className='PrivateCloudCard__text'>
            <div className='PrivateCloudCard__text-title'>
                <FormattedMessage
                    id='admin.billing.subscription.privateCloudCard.title'
                    defaultMessage='Looking for a high-trust private cloud?'
                />
            </div>
            <div className='PrivateCloudCard__text-description'>
                <FormattedMessage
                    id='admin.billing.subscription.privateCloudCard.description'
                    defaultMessage='If you need software with dedicated, single-tenant architecture, Mattermost Private Cloud (Beta) is the solution for high-trust collaboration.'
                />
            </div>
            <button className='PrivateCloudCard__contactSales'>
                <FormattedMessage
                    id='admin.billing.subscription.privateCloudCard.contactSales'
                    defaultMessage='Contact Sales'
                />
            </button>
        </div>
        <div className='PrivateCloudCard__image'>
            <img src={privateCloudImage}/>
        </div>
    </div>
);

const WARNING_THRESHOLD = 3;

// TODO: temp
const isFree = false;

type Props = {
};

const BillingSubscriptions: React.FC<Props> = () => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();
    const userLimit = useSelector((state: GlobalState) => parseInt(getConfig(state).ExperimentalCloudUserLimit!, 10));
    const analytics = useSelector((state: GlobalState) => state.entities.admin.analytics);
    const currentUser = useSelector((state: GlobalState) => getCurrentUser(state));
    const isCloud = useSelector((state: GlobalState) => getLicense(state).Cloud === 'true');
    const getCategory = makeGetCategory();
    const preferences = useSelector<GlobalState, PreferenceType[]>((state) => getCategory(state, Preferences.ADMIN_CLOUD_UPGRADE_PANEL));

    const testTooltipLeft = (
        <Tooltip
            id='BillingSubscriptions__testTooltip'
            className='BillingSubscriptions__tooltip BillingSubscriptions__tooltip-left'
        >
            <div className='BillingSubscriptions__tooltipTitle'>
                {'Seat count overages'}
            </div>
            <div className='BillingSubscriptions__tooltipMessage'>
                {'Prolonged overages may result in additional charges. See how billing works'}
            </div>
        </Tooltip>
    );

    const testTooltipRight = (
        <Tooltip
            id='BillingSubscriptions__testTooltip'
            className='BillingSubscriptions__tooltip BillingSubscriptions__tooltip-right'
        >
            <div className='BillingSubscriptions__tooltipTitle'>
                {'What are partial charges?'}
            </div>
            <div className='BillingSubscriptions__tooltipMessage'>
                {'Users who have not been enabled for the full duration of the month are charged at a prorated monthly rate.'}
            </div>
        </Tooltip>
    );

    const [showDanger, setShowDanger] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [dropdownValue, setDropdownValue] = useState<{label: string, value: string} | undefined>(undefined);

    useEffect(() => {
        if (!analytics) {
            (async function getAllAnalytics() {
                await dispatch(getStandardAnalytics());
            }());
        }
    }, []);

    const shouldShowInfoBanner = (): boolean => {
        if (!analytics || !isCloud || !userLimit || !preferences || preferences.some((pref: PreferenceType) => pref.name === CloudBanners.HIDE && pref.value === 'true')) {
            return false;
        }

        if ((userLimit - Number(analytics.TOTAL_USERS)) <= WARNING_THRESHOLD && (userLimit - Number(analytics.TOTAL_USERS) >= 0)) {
            return true;
        }

        return false;
    };

    const handleHide = async () => {
        dispatch(savePreferences(currentUser.id, [
            {
                category: Preferences.ADMIN_CLOUD_UPGRADE_PANEL,
                user_id: currentUser.id,
                name: CloudBanners.HIDE,
                value: 'true',
            },
        ]));
    };

    return (
        <div className='wrapper--fixed BillingSubscriptions'>
            <FormattedAdminHeader
                id='admin.billing.subscription.title'
                defaultMessage='Subscriptions'
            />
            <div className='admin-console__wrapper'>
                <div className='admin-console__content'>
                    {showDanger && (
                        <AlertBanner
                            mode='danger'
                            title='Test Danger Title'
                            message='This is a test danger message'
                            onDismiss={() => setShowDanger(false)}
                        />
                    )}
                    {showWarning && (
                        <AlertBanner
                            mode='warning'
                            title='Test Warning Title'
                            message='This is a test warning message'
                            onDismiss={() => setShowWarning(false)}
                        />
                    )}
                    {shouldShowInfoBanner() && (
                        <AlertBanner
                            mode='info'
                            title={formatMessage({
                                id: 'billing.subscription.info.headsup',
                                defaultMessage: 'Just a heads up',
                            })}
                            message={formatMessage({
                                id: 'billing.subscription.info.headsup.description',
                                defaultMessage:
                    'You’re nearing the user limit with the free tier of Mattermost Cloud. We’ll let you know if you hit that limit.',
                            })}
                            onDismiss={() => handleHide()}
                        />
                    )}
                    <div
                        className='BillingSubscriptions__topWrapper'
                        style={{marginTop: '20px'}}
                    >
                        <div
                            style={{
                                border: '1px solid #000',
                                width: '568px',
                                padding: '8px',
                                backgroundColor: '#fff',
                            }}
                        >
                            {'Plan Details Card'}
                            <DropdownInput
                                onChange={(value) => setDropdownValue(value)}
                                value={dropdownValue}
                                options={[
                                    {label: 'Option 1', value: 'option-1'},
                                    {label: 'Option 2', value: 'option-2'},
                                    {label: 'Option 3', value: 'option-3'},
                                ]}
                                legend={'Test dropdown'}
                                placeholder='Select item here'
                                name='BillingSubscriptions__testDropdown'
                                error={dropdownValue ? undefined : 'This field is required'}
                            />
                            <br/>
                            <OverlayTrigger
                                delayShow={500}
                                placement='bottom'
                                overlay={testTooltipLeft}
                            >
                                <button>{'Left Side Test Button'}</button>
                            </OverlayTrigger>
                            <OverlayTrigger
                                delayShow={500}
                                placement='bottom'
                                overlay={testTooltipRight}
                            >
                                <button>{'Right Side Test Button'}</button>
                            </OverlayTrigger>
                        </div>
                        {isFree ? upgradeMattermostCloud() : <BillingSummary/>}
                    </div>
                    {privateCloudCard()}
                </div>
            </div>
        </div>
    );
};

export default BillingSubscriptions;
