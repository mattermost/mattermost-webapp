import {GlobalState} from '@mattermost/types/store';
import {UserProfile} from '@mattermost/types/users';
import {General} from 'mattermost-redux/constants';

export const emptyUserProfile: () => UserProfile = () => ({
    id: '',
    create_at: 0,
    update_at: 0,
    delete_at: 0,
    username: '',
    password: '',
    auth_data: '',
    auth_service: '',
    email: '',
    email_verified: false,
    nickname: '',
    first_name: '',
    last_name: '',
    position: '',
    roles: '',
    allow_marketing: false,
    props: {},
    notify_props: {
        desktop: 'default',
        desktop_sound: 'true',
        email: 'true',
        mark_unread: 'all',
        push: 'default',
        push_status: 'online',
        comments: 'never',
        first_name: 'true',
        channel: 'true',
        mention_keys: '',
    },
    last_password_update: 0,
    last_picture_update: 0,
    failed_attempts: 0,
    locale: '',
    mfa_active: false,
    mfa_secret: '',
    last_activity_at: 0,
    is_bot: false,
    bot_description: '',
    bot_last_icon_update: 0,
    terms_of_service_id: '',
    terms_of_service_create_at: 0,
    remote_id: '',
    status: '',
});

const emptyOtherUsersState: Omit<GlobalState['entities']['users'], 'profiles' | 'currentUserId'> = {
    isManualStatus: {},
    mySessions: [],
    myAudits: [],
    profilesInTeam: {},
    profilesNotInTeam: {},
    profilesWithoutTeam: new Set(),
    profilesInChannel: {},
    profilesNotInChannel: {},
    profilesInGroup: {},
    profilesNotInGroup: {},
    statuses: {},
    stats: {},
    myUserAccessTokens: {},
}

export const adminUsersState: () => GlobalState['entities']['users'] = () => ({
    ...emptyOtherUsersState,
    currentUserId: 'current_user_id',
    profiles: {
        current_user_id: {
            ...emptyUserProfile(),
            roles: General.SYSTEM_ADMIN_ROLE,
        },
    },
});

export const endUsersState: () => GlobalState['entities']['users'] = () => ({
    ...emptyOtherUsersState,
    currentUserId: 'current_user_id',
    profiles: {
        current_user_id: {
            ...emptyUserProfile(),
            roles: General.CHANNEL_USER_ROLE,
        },
    },
});
