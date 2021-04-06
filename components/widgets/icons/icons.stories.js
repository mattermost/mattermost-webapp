// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {storiesOf} from '@storybook/react';
import {withKnobs} from '@storybook/addon-knobs';

import AccordionToggleIcon from './accordion_toggle_icon';
import AlertIcon from './alert_icon';
import ArchiveIcon from './archive_icon';
import ArrowRightIcon from './arrow_right_icon';
import AtIcon from './at_icon';
import AttachmentIcon from './attachment_icon';
import BackIcon from './back_icon';
import BotIcon from './bot_icon';
import CheckboxCheckedIcon from './checkbox_checked_icon';
import CheckboxPartialIcon from './checkbox_partial_icon';
import CloseCircleIcon from './close_circle_icon';
import CloseCircleSolidIcon from './close_circle_solid_icon';
import CloseIcon from './close_icon';
import DotsHorizontal from './dots_horizontal';
import DownloadIcon from './download_icon';
import DraftIcon from './draft_icon';
import EmailIcon from './email_icon';
import EmojiIcon from './emoji_icon';
import FaAddIcon from './fa_add_icon';
import FaBackIcon from './fa_back_icon';
import FaDropdownIcon from './fa_dropdown_icon';
import FaEditIcon from './fa_edit_icon';
import FaLogoutIcon from './fa_logout_icon';
import FaNextIcon from './fa_next_icon';
import FaPreviousIcon from './fa_previous_icon';
import FaReloadIcon from './fa_reload_icon';
import FaRemoveIcon from './fa_remove_icon';
import FaSearchIcon from './fa_search_icon';
import FaSelectIcon from './fa_select_icon';
import FaSuccessIcon from './fa_success_icon';
import FaWarningIcon from './fa_warning_icon';
import FlagIconFilled from './flag_icon_filled';
import FlagIcon from './flag_icon';
import GfycatIcon from './gfycat_icon';
import GifReactionsIcon from './gif_reactions_icon';
import GifSearchClearIcon from './gif_search_clear_icon';
import GifSearchIcon from './gif_search_icon';
import GifTrendingIcon from './gif_trending_icon';
import GlobeIcon from './globe_icon';
import InfoIcon from './info_icon';
import InfoSmallIcon from './info_small_icon';
import InviteIcon from './invite_icon';
import LeaveTeamIcon from './leave_team_icon';
import LinkIcon from './link_icon';
import LockIcon from './lock_icon';
import MailIcon from './mail_icon';
import MailPlusIcon from './mail_plus_icon';
import MattermostLogo from './mattermost_logo';
import MemberIcon from './member_icon';
import MentionsIcon from './mentions_icon';
import MenuIcon from './menu_icon';
import MessageIcon from './message_icon';
import PinIcon from './pin_icon';
import ReplyIcon from './reply_icon';
import ScrollToBottomIcon from './scroll_to_bottom_icon';
import SearchIcon from './search_icon';
import ShieldOutlineIcon from './shield_outline_icon';
import StatusAwayAvatarIcon from './status_away_avatar_icon';
import StatusAwayIcon from './status_away_icon';
import StatusDndAvatarIcon from './status_dnd_avatar_icon';
import StatusDndIcon from './status_dnd_icon';
import StatusOfflineAvatarIcon from './status_offline_avatar_icon';
import StatusOfflineIcon from './status_offline_icon';
import StatusOnlineAvatarIcon from './status_online_avatar_icon';
import StatusOnlineIcon from './status_online_icon';
import TeamInfoIcon from './team_info_icon';
import UnreadBelowIcon from './unread_below_icon';

const icons = [
    AccordionToggleIcon, AlertIcon, ArchiveIcon, AtIcon, ArrowRightIcon,
    AttachmentIcon, BackIcon, BotIcon, CheckboxCheckedIcon,
    CheckboxPartialIcon, CloseCircleIcon, CloseCircleSolidIcon, CloseIcon,
    DotsHorizontal, DownloadIcon, DraftIcon, EmailIcon, EmojiIcon, FaAddIcon, FaBackIcon, FaDropdownIcon,
    FaEditIcon, FaLogoutIcon, FaNextIcon, FaPreviousIcon, FaReloadIcon,
    FaRemoveIcon, FaSearchIcon, FaSelectIcon, FaSuccessIcon, FaWarningIcon,
    FlagIconFilled, FlagIcon, GfycatIcon, GifReactionsIcon,
    GifSearchClearIcon, GifSearchIcon, GifTrendingIcon, GlobeIcon, InfoIcon,
    InfoSmallIcon, InviteIcon, LeaveTeamIcon, LinkIcon, LockIcon, MailIcon,
    MailPlusIcon, MattermostLogo, MemberIcon, MentionsIcon, MenuIcon,
    MessageIcon, PinIcon, ReplyIcon, ScrollToBottomIcon, SearchIcon, ShieldOutlineIcon,
    StatusAwayAvatarIcon, StatusAwayIcon, StatusDndAvatarIcon, StatusDndIcon,
    StatusOfflineAvatarIcon, StatusOfflineIcon, StatusOnlineAvatarIcon,
    StatusOnlineIcon, TeamInfoIcon, UnreadBelowIcon,
];

const stories = storiesOf('Widgets/Icons', module).addDecorator(withKnobs);

stories.add('Icons', () => {
    return (
        <div style={{display: 'flex', width: '100%', flexWrap: 'wrap'}}>
            {icons.map((Icon, index) => (
                <div
                    key={index}
                    style={{width: 128, height: 128, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', border: '1px solid #eeeeee', borderRadius: 5, margin: 10}}
                >
                    <Icon/>
                    <div>{Icon.displayName}</div>
                </div>
            ))}
        </div>
    );
});
