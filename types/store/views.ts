// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Channel} from 'mattermost-redux/types/channels';
import {MarketplacePlugin} from 'mattermost-redux/types/plugins';
import {Dictionary} from 'mattermost-redux/types/utilities';

import {I18nState} from './i18n';
import {RhsViewState} from './rhs';

import {DraggingState} from '.';

export type ViewsState = {
    admin: {
        navigationBlock: {
            blocked: boolean;
            onNavigationConfirmed: () => void;
            showNavigationPrompt: boolean;
        };
    };

    browser: {
        focused: boolean;
    };

    channel: {
        postVisibility: {
            [channelId: string]: number;
        };
        lastChannelViewTime: {
            [channelId: string]: number;
        };
        loadingPost: {
            [channelId: string]: boolean;
        };
        focusedPostId: string;
        mobileView: boolean;
        lastUnreadChannel: (Channel & {hadMentions: boolean}) | null; // Actually only an object with {id: string, hadMentions: boolean}
        lastGetPosts: {
            [channelId: string]: number;
        };
        channelPrefetchStatus: {
            [channelId: string]: string;
        };
    };

    rhs: RhsViewState;

    posts: {
        editingPost: {
            show: boolean;
        };
        menuActions: {
            [postId: string]: {
                [actionId: string]: {
                    text: string;
                    value: string;
                };
            };
        };
    };

    modals: {
        [modalId: string]: {
            open: boolean;
            dialogProps: Dictionary<any>;
            dialogType: React.Component;
        };
    };

    emoji: {
        emojiPickerCustomPage: 0;
    };

    i18n: I18nState;

    lhs: {
        isOpen: boolean;
    };

    search: {
        modalSearch: string;
        modalFilters: {
            roles?: string[];
            channel_roles?: string[];
            team_roles?: string[];
        };
        systemUsersSearch: {
            term: string;
            team: string;
            filter: string;
        };
        userGridSearch: {
            term: string;
            filters: {
                roles?: string[];
                channel_roles?: string[];
                team_roles?: string[];
            };
        };
    };

    notice: {
        hasBeenDismissed: {
            [message: string]: boolean;
        };
    };

    system: {
        websocketConnectErrorCount: number;
    };

    channelSelectorModal: {
        channels: Channel[];
    };

    settings: {
        activeSection: string;
        previousActiveSection: string;
    };

    marketplace: {
        plugins: MarketplacePlugin[];
        installing: {[pluginId: string]: boolean};
        errors: {[pluginId: string]: string};
        filter: string;
    };

    channelSidebar: {
        unreadFilterEnabled: boolean;
        draggingState: DraggingState;
        newCategoryIds: string[];
        multiSelectedChannelIds: string[];
        lastSelectedChannel: string;
    };

    nextSteps: {
        show: boolean;
    };

    statusDropdown: {
        isOpen: boolean;
    };
};
