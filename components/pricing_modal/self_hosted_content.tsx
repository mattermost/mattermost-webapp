// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {Modal} from 'react-bootstrap';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';

import {trackEvent} from 'actions/telemetry_actions';
import {closeModal} from 'actions/views/modals';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {GlobalState} from '@mattermost/types/store';
import {getPrevTrialLicense} from 'mattermost-redux/actions/admin';

import StarMarkSvg from 'components/widgets/icons/star_mark_icon';
import CheckMarkSvg from 'components/widgets/icons/check_mark_icon';
import PlanLabel from 'components/common/plan_label';
import StartTrialBtn from 'components/learn_more_trial_modal/start_trial_btn';

import ContactSalesCTA from './contact_sales_cta';
import StartTrialCaution from './start_trial_caution';
import Card, {ButtonCustomiserClasses} from './card';

import LadySvg from './lady.svg';
import ManSvg from './man.svg';

import './content.scss';

type ContentProps = {
    onHide: () => void;
}

function SelfHostedContent(props: ContentProps) {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getPrevTrialLicense());
    }, []);

    const isAdmin = useSelector(isCurrentUserSystemAdmin);

    const license = useSelector(getLicense);
    const prevSelfHostedTrialLicense = useSelector((state: GlobalState) => state.entities.admin.prevTrialLicense);

    const isSelfHostedEnterpriseTrial = license.IsTrial === 'true';

    const isStarter = license.IsLicensed === 'false';
    const isPostSelfHostedEnterpriseTrial = prevSelfHostedTrialLicense.IsLicensed === 'true';

    const closePricingModal = () => {
        dispatch(closeModal(ModalIdentifiers.PRICING_MODAL));
    };

    const SelfHostedBriefing = {
        starter: [
            formatMessage({id: 'pricing_modal.briefing.unlimitedWorkspaceTeams', defaultMessage: 'Unlimited workspace teams'}),
            formatMessage({id: 'pricing_modal.briefing.unlimitedPlaybookRuns', defaultMessage: 'Unlimited playbooks and runs'}),
            formatMessage({id: 'pricing_modal.extra_briefing.starter.calls', defaultMessage: '1:1 voice calls and screen share'}),
            formatMessage({id: 'pricing_modal.briefing.fullMessageAndHistory', defaultMessage: 'Full message and file history'}),
        ],
        professional: [
            formatMessage({id: 'pricing_modal.briefing.customUserGroups', defaultMessage: 'Custom user groups'}),
            formatMessage({id: 'pricing_modal.briefing.voiceCallsScreenSharingInGroupMessagesAndChannels', defaultMessage: 'Voice calls and screen sharing in group messages and channels'}),
            formatMessage({id: 'pricing_modal.extra_briefing.professional.ssoSaml', defaultMessage: 'SSO with SAML 2.0, including Okta, OneLogin and ADFS'}),
        ],
        enterprise: [
            formatMessage({id: 'pricing_modal.briefing.enterprise.groupSync', defaultMessage: 'AD/LDAP group sync'}),
            formatMessage({id: 'pricing_modal.briefing.enterprise.mobileSecurity', defaultMessage: 'Advanced mobile security via ID-only push notifications'}),
            formatMessage({id: 'pricing_modal.briefing.enterprise.rolesAndPermissions', defaultMessage: 'Advanced roles and permissions'}),
        ],
    };

    const SelfHostedExtraBriefing = {
        starter: [
            formatMessage({id: 'pricing_modal.briefing.ssoWithGitLab', defaultMessage: 'SSO with Gitlab'}),
        ],
        professional: [
            formatMessage({id: 'pricing_modal.extra_briefing.professional.ssoadLdap', defaultMessage: 'SSO support with AD/LDAP, Google, O365, OpenID'}),
            formatMessage({id: 'pricing_modal.extra_briefing.professional.guestAccess', defaultMessage: 'Guest access with MFA enforcement'}),
        ],
        enterprise: [
            formatMessage({id: 'pricing_modal.briefing.enterprise.compliance', defaultMessage: 'Advanced compliance management'}),
            formatMessage({id: 'pricing_modal.extra_briefing.enterprise.playBookAnalytics', defaultMessage: 'Playbook analytics dashboard'}),
        ],
    };

    const renderAlert = () => {
        return (<div className='alert-option'>
            <span>
                {formatMessage({id: 'pricing_modal.lookingForCloudOption', defaultMessage: 'Looking for a cloud option?'})}
            </span>
            <a
                onClick={() => {
                    trackEvent(
                        TELEMETRY_CATEGORIES.SELF_HOSTED_PURCHASING,
                        'click_looking_for_a_cloud_option',
                    );
                }
                }
                href='https://mattermost.com/sign-up/'
                rel='noopener noreferrer'
                target='_blank'
            >{formatMessage({id: 'pricing_modal.reviewDeploymentOptions', defaultMessage: 'Review deployment options'})}</a>
        </div>);
    };

    const trialButton = (): JSX.Element => {
        return (
            <StartTrialBtn
                message={formatMessage({id: 'pricing_modal.btn.tryDays', defaultMessage: 'Try free for {days} days'}, {days: '30'})}
                telemetryId='start_trial_from_learn_more_about_trial_modal'
                renderAsButton={true}
                disabled={isSelfHostedEnterpriseTrial}
                btnClass={`plan_action_btn ${isSelfHostedEnterpriseTrial ? ButtonCustomiserClasses.grayed : ButtonCustomiserClasses.special}`}
                onClick={closePricingModal}
            />);
    };

    return (
        <div className='Content'>
            <Modal.Header className='PricingModal__header'>
                <div className='header_lhs'>
                    <h1 className='title'>
                        {formatMessage({id: 'pricing_modal.title', defaultMessage: 'Select a plan'})}
                    </h1>
                    <div>{formatMessage({id: 'pricing_modal.subtitle', defaultMessage: 'Choose a plan to get started'})}</div>
                </div>
                <button
                    id='closeIcon'
                    className='icon icon-close'
                    aria-label='Close'
                    title='Close'
                    onClick={props.onHide}
                />
            </Modal.Header>
            <Modal.Body>
                {renderAlert()}
                <div className='PricingModal__body'>
                    <div className='self-hosted-svg-left'>
                        <LadySvg/>
                    </div>
                    <div className='self-hosted-svg-right'>
                        <ManSvg/>
                    </div>
                    <Card
                        id='starter'
                        topColor='#9DA7B8'
                        plan='Starter'
                        price={formatMessage({id: 'pricing_modal.price.free', defaultMessage: 'Free'})}
                        briefing={{
                            title: formatMessage({id: 'pricing_modal.briefing.title', defaultMessage: 'Top features'}),
                            items: SelfHostedBriefing.starter,
                        }}
                        extraBriefing={{
                            title: formatMessage({id: 'pricing_modal.extra_briefing.title', defaultMessage: 'More features'}),
                            items: SelfHostedExtraBriefing.starter,
                        }}
                        buttonDetails={{
                            action: () => {},
                            text: formatMessage({id: 'pricing_modal.btn.downgrade', defaultMessage: 'Downgrade'}),
                            disabled: true,
                            customClass: ButtonCustomiserClasses.secondary,
                        }}
                        planLabel={
                            isStarter ? (
                                <PlanLabel
                                    text={formatMessage({id: 'pricing_modal.planLabel.currentPlan', defaultMessage: 'CURRENT PLAN'})}
                                    color='var(--denim-status-online)'
                                    bgColor='var(--center-channel-bg)'
                                    firstSvg={<CheckMarkSvg/>}
                                />) : undefined}
                    />
                    <Card
                        id='professional'
                        topColor='#4A69AC'
                        plan='Professional'
                        price='$10'
                        rate={formatMessage({id: 'pricing_modal.rate.userPerMonth', defaultMessage: '/user/month'})}
                        briefing={{
                            title: formatMessage({id: 'pricing_modal.briefing.title', defaultMessage: 'Top features'}),
                            items: SelfHostedBriefing.professional,
                        }}
                        extraBriefing={{
                            title: formatMessage({id: 'pricing_modal.extra_briefing.title', defaultMessage: 'More features'}),
                            items: SelfHostedExtraBriefing.professional,
                        }}
                        buttonDetails={{
                            action: () => {
                                window.open('https://customers.mattermost.com/', '_blank');
                            },
                            text: formatMessage({id: 'pricing_modal.btn.upgrade', defaultMessage: 'Upgrade'}),
                            disabled: !isAdmin,
                            customClass: isPostSelfHostedEnterpriseTrial ? ButtonCustomiserClasses.special : ButtonCustomiserClasses.active,
                        }}
                        planLabel={
                            <PlanLabel
                                text={formatMessage({id: 'pricing_modal.planLabel.mostPopular', defaultMessage: 'MOST POPULAR'})}
                                bgColor='var(--title-color-indigo-500)'
                                color='var(--button-color)'
                                firstSvg={<StarMarkSvg/>}
                                secondSvg={<StarMarkSvg/>}
                            />}
                    />
                    <Card
                        id='enterprise'
                        topColor='var(--denim-button-bg)'
                        plan='Enterprise'
                        price={formatMessage({id: 'pricing_modal.price.contactSales', defaultMessage: 'Contact sales'})}
                        briefing={{
                            title: formatMessage({id: 'pricing_modal.briefing.title', defaultMessage: 'Top features'}),
                            items: SelfHostedBriefing.enterprise,
                        }}
                        extraBriefing={{
                            title: formatMessage({id: 'pricing_modal.extra_briefing.title', defaultMessage: 'More features'}),
                            items: SelfHostedExtraBriefing.enterprise,
                        }}
                        planExtraInformation={(isPostSelfHostedEnterpriseTrial || !isAdmin) ? undefined : <ContactSalesCTA/>}
                        buttonDetails={(isPostSelfHostedEnterpriseTrial || !isAdmin) ? {
                            action: () => {
                                trackEvent('self_hosted_pricing', 'click_enterprise_contact_sales');
                                window.open('https://mattermost.com/contact-sales/', '_blank');
                            },
                            text: formatMessage({id: 'pricing_modal.btn.contactSales', defaultMessage: 'Contact Sales'}),
                            customClass: ButtonCustomiserClasses.active,
                        } : undefined}
                        customButtonDetails={(!isPostSelfHostedEnterpriseTrial && isAdmin) ? (
                            trialButton()
                        ) : undefined}
                        planDisclaimer={isPostSelfHostedEnterpriseTrial ? undefined : <StartTrialCaution/>}
                    />
                </div>
            </Modal.Body>
        </div>
    );
}

export default SelfHostedContent;
