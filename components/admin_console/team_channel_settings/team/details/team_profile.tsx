// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useMemo, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';
import {useDispatch, useSelector} from 'react-redux';
import {noop} from 'lodash';

import {ModalIdentifiers} from 'utils/constants';
import {t} from 'utils/i18n';
import {getRoleForTrackFlow, getTrackFlowRole, imageURLForTeam, localizeMessage} from 'utils/utils';

import {Team} from '@mattermost/types/teams';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {openModal} from 'actions/views/modals';

import useGetUsage from 'components/common/hooks/useGetUsage';
import PricingModal from 'components/pricing_modal';
import Tooltip from 'components/tooltip';
import OverlayTrigger from 'components/overlay_trigger';
import useGetUsageDeltas from 'components/common/hooks/useGetUsageDeltas';
import AdminPanel from 'components/widgets/admin_console/admin_panel';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import ArchiveIcon from 'components/widgets/icons/archive_icon';
import UnarchiveIcon from 'components/widgets/icons/unarchive_icon';
import TeamIcon from 'components/widgets/team_icon/team_icon';

import './team_profile.scss';
import {getSiteURL} from 'utils/url';
import useCopyText from 'components/common/hooks/useCopyText';
import {trackEvent} from 'actions/telemetry_actions';
import {getAnalyticsCategory} from 'components/onboarding_tasks';
import TeamSettingsModal from 'components/team_settings_modal/team_settings_modal';

type CopyLinkButtonProps = {
    team: Team;
}
const CopyLinkButton = ({
    team,
}: CopyLinkButtonProps) => {
    const inviteURL = useMemo(() => {
        return `${getSiteURL()}/signup_user_complete/?id=${team.invite_id}&sbr=${getTrackFlowRole()}`;
    }, [team.invite_id]);

    const copyText = useCopyText({
        trackCallback: () => trackEvent(getAnalyticsCategory(true), 'click_copy_invite_link', getRoleForTrackFlow()),
        text: inviteURL,
        successCopyTimeout: 2000,
    });

    return (
        <button
            onClick={copyText.onClick}
            data-testid='InviteView__copyInviteLink'
            aria-label='team invite link'
            className='team-channel-action-button'
            style={{
                color: copyText.copiedRecently ? 'var(--online-indicator)' : '',
            }}
        >
            {
                (copyText.copiedRecently) ? (
                    <>
                        <i className='icon icon-check'/>
                        <FormattedMessage
                            id='invite_modal.copied'
                            defaultMessage='Copied'
                        />
                    </>
                ) : (
                    <>
                        <i className='icon icon-link-variant'/>
                        <FormattedMessage
                            id='admin.team_settings.team_detail.copyInviteLink'
                            defaultMessage='Copy team invite link'
                        />
                    </>
                )
            }

        </button>
    );
};

type TeamSettingsButtonProps = {
    team: Team;
}

const TeamSettingsButton = ({
    team,
}: TeamSettingsButtonProps) => {
    const [showTeamSettingsModal, setShowTeamSettingsModal] = useState(false);
    return (
        <>
            {
                showTeamSettingsModal && (
                    <TeamSettingsModal
                        onExited={() => setShowTeamSettingsModal(false)}
                        team={team}
                    />
                )
            }
            <button
                onClick={() => setShowTeamSettingsModal(true)}
                aria-label='edit team settings'
                className='team-channel-action-button'
            >
                <i
                    data-testid='draftIcon'
                    className='icon icon-pencil-outline channel-pencil-icon'
                />
                <FormattedMessage
                    id='admin.team_settings.team_detail.teamSettings'
                    defaultMessage='Edit team settings'
                />
            </button>
        </>
    );
};

type Props = {
    team: Team;
    isArchived: boolean;
    onToggleArchive: () => void;
    isDisabled?: boolean;
    saveNeeded?: boolean;
}

export function TeamProfile({team, isArchived, onToggleArchive, isDisabled, saveNeeded}: Props) {
    const teamIconUrl = imageURLForTeam(team);
    const usageDeltas = useGetUsageDeltas();
    const dispatch = useDispatch();
    const usage = useGetUsage();
    const license = useSelector(getLicense);

    const [overrideRestoreDisabled, setOverrideRestoreDisabled] = useState(false);
    const [restoreDisabled, setRestoreDisabled] = useState(usageDeltas.teams.teamsLoaded && usageDeltas.teams.active >= 0 && isArchived);

    useEffect(() => {
        setRestoreDisabled(license.Cloud === 'true' && usageDeltas.teams.teamsLoaded && usageDeltas.teams.active >= 0 && isArchived && !overrideRestoreDisabled && !saveNeeded);
    }, [usageDeltas, isArchived, overrideRestoreDisabled, saveNeeded, license]);

    // If in a cloud context and the teams usage hasn't loaded, don't render anything to prevent weird flashes on the screen
    if (license.Cloud === 'true' && !usage.teams.teamsLoaded) {
        return null;//
    }

    let archiveBtnID: string;
    let archiveBtnDefault: string;
    if (isArchived) {
        archiveBtnID = t('admin.team_settings.team_details.unarchiveTeam');
        archiveBtnDefault = 'Unarchive Team';
    } else {
        archiveBtnID = t('admin.team_settings.team_details.archiveTeam');
        archiveBtnDefault = 'Archive Team';
    }

    const toggleArchive = () => {
        setOverrideRestoreDisabled(true);
        onToggleArchive();
    };
    const archiveButton = () => {
        if (restoreDisabled) {
            return (
                <OverlayTrigger
                    delay={400}
                    placement='bottom'
                    disabled={!restoreDisabled}
                    overlay={
                        <Tooltip id='sharedTooltip'>
                            <div className={'tooltip-title'}>
                                <FormattedMessage
                                    id={'workspace_limits.teams_limit_reached.upgrade_to_unarchive'}
                                    defaultMessage={'Upgrade to Unarchive'}
                                />
                            </div>
                            <div className={'tooltip-body'}>
                                <FormattedMessage
                                    id={'workspace_limits.teams_limit_reached.tool_tip'}
                                    defaultMessage={'You\'ve reached the team limit for your current plan. Consider upgrading to unarchive this team or archive your other teams'}
                                />
                            </div>
                        </Tooltip>
                    }
                >
                    {/* OverlayTrigger doesn't play nicely with `disabled` buttons, because the :hover events don't fire. This is a workaround to ensure the popover appears see: https://github.com/react-bootstrap/react-bootstrap/issues/1588*/}
                    <div
                        className={'disabled-overlay-wrapper'}
                    >
                        <button
                            type='button'
                            disabled={restoreDisabled}
                            style={{pointerEvents: 'none'}}
                            className={
                                classNames(
                                    'btn',
                                    'btn-secondary',
                                    'ArchiveButton',
                                    {ArchiveButton___archived: isArchived},
                                    {ArchiveButton___unarchived: !isArchived},
                                    {disabled: isDisabled},
                                    'cloud-limits-disabled',
                                )
                            }
                            onClick={noop}
                        >
                            {isArchived ? (
                                <UnarchiveIcon
                                    className='channel-icon channel-icon__unarchive'
                                />
                            ) : (
                                <ArchiveIcon className='channel-icon channel-icon__archive'/>
                            )}
                            <FormattedMessage
                                id={archiveBtnID}
                                defaultMessage={archiveBtnDefault}
                            />
                        </button>
                    </div>
                </OverlayTrigger>

            );
        }
        return (
            <button
                type='button'
                disabled={restoreDisabled}
                className={
                    classNames(
                        'btn',
                        'btn-secondary',
                        'ArchiveButton',
                        {ArchiveButton___archived: isArchived},
                        {ArchiveButton___unarchived: !isArchived},
                        {disabled: isDisabled},
                        'cloud-limits-disabled',
                    )
                }
                onClick={toggleArchive}
            >
                {isArchived ? (
                    <UnarchiveIcon
                        className='channel-icon channel-icon__unarchive'
                    />
                ) : (
                    <ArchiveIcon className='channel-icon channel-icon__archive'/>
                )}
                <FormattedMessage
                    id={archiveBtnID}
                    defaultMessage={archiveBtnDefault}
                />
            </button>
        );
    };

    return (
        <AdminPanel
            id='team_profile'
            titleId={t('admin.team_settings.team_detail.profileTitle')}
            titleDefault='Team Profile'
            subtitleId={t('admin.team_settings.team_detail.profileDescription')}
            subtitleDefault='Summary of the team, including team name and description.'
        >

            <div className='group-teams-and-channels'>

                <div className='group-teams-and-channels--body'>
                    <div className='d-flex'>
                        <div className='large-team-image-col'>
                            <TeamIcon
                                content={team.display_name}
                                size='lg'
                                url={teamIconUrl}
                            />
                        </div>
                        <div className='team-desc-col'>
                            <div className='row-bottom-padding'>
                                <FormattedMarkdownMessage
                                    id='admin.team_settings.team_detail.teamName'
                                    defaultMessage='**Team Name**:'
                                />
                                <br/>
                                {team.display_name}
                            </div>
                            <div>
                                <FormattedMarkdownMessage
                                    id='admin.team_settings.team_detail.teamDescription'
                                    defaultMessage='**Team Description**:'
                                />
                                <br/>
                                {team.description || <span className='greyed-out'>{localizeMessage('admin.team_settings.team_detail.profileNoDescription', 'No team description added.')}</span>}
                            </div>
                        </div>
                        <div className='team-desc-col'>
                            <div className='row-bottom-padding'>
                                <FormattedMarkdownMessage
                                    id='admin.team_settings.team_detail.teamId'
                                    defaultMessage='**Team ID**:'
                                />
                                <br/>
                                {team.id}
                            </div>
                        </div>
                    </div>
                    <div className='AdminChannelDetails_archiveContainer'>
                        <div
                            className='d-flex flex-row'
                            style={{
                                gap: '1rem',
                            }}
                        >
                            <TeamSettingsButton team={team}/>
                            {team && team.invite_id && <CopyLinkButton team={team}/> }
                            {restoreDisabled &&
                                <button
                                    onClick={() => {
                                        dispatch(openModal({
                                            modalId: ModalIdentifiers.PRICING_MODAL,
                                            dialogType: PricingModal,
                                        }));
                                    }}
                                    type='button'
                                    className={
                                        classNames(
                                            'btn',
                                            'btn-secondary',
                                            'upgrade-options-button',
                                        )
                                    }
                                >
                                    <FormattedMessage
                                        id={'workspace_limits.teams_limit_reached.view_upgrade_options'}
                                        defaultMessage={'View upgrade options'}
                                    />
                                </button>}
                            {archiveButton()}
                        </div>
                    </div>
                </div>
            </div>

        </AdminPanel>
    );
}
