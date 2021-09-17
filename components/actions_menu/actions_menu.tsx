// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';

import {Tooltip} from 'react-bootstrap';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import {Post} from 'mattermost-redux/types/posts';
import {AppBinding} from 'mattermost-redux/types/apps';
import {AppCallResponseTypes, AppCallTypes, AppExpandLevels} from 'mattermost-redux/constants/apps';

import {DoAppCall, PostEphemeralCallResponseForPost} from 'types/apps';
import {Locations, Constants, ModalIdentifiers} from 'utils/constants';
import Permissions from 'mattermost-redux/constants/permissions';
import ActionsTutorialTip from 'components/actions_menu/actions_menu_tutorial_tip';
import MarketplaceModal from 'components/plugin_marketplace';
import OverlayTrigger from 'components/overlay_trigger';
import * as PostUtils from 'utils/post_utils';
import * as Utils from 'utils/utils.jsx';
import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';
import Pluggable from 'plugins/pluggable';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import {PluginComponent} from 'types/store/plugins';
import {createCallContext, createCallRequest} from 'utils/apps';

const MENU_BOTTOM_MARGIN = 80;

export const PLUGGABLE_COMPONENT = 'PostDropdownMenuItem';
type Props = {
    intl: IntlShape;
    post: Post;
    isSysAdmin: boolean;
    teamId?: string;
    location?: 'CENTER' | 'RHS_ROOT' | 'RHS_COMMENT' | 'SEARCH' | string;
    handleDropdownOpened?: (open: boolean) => void;
    isMenuOpen?: boolean;
    pluginMenuItems?: PluginComponent[];
    appBindings?: AppBinding[];
    appsEnabled: boolean;
    showTutorialTip: boolean;

    /**
     * Components for overriding provided by plugins
     */
    components: {
        [componentName: string]: PluginComponent[];
    };

    actions: {

        /**
         * Function to open a modal
         */
        openModal: (postId: any) => void;

        /**
         * Function to perform an app call
         */
        doAppCall: DoAppCall;

        /**
         * Function to post the ephemeral message for a call response
         */
        postEphemeralCallResponseForPost: PostEphemeralCallResponseForPost;

    }; // TechDebt: Made non-mandatory while converting to typescript
}

type State = {
    openUp: boolean;
}

export class ActionMenuClass extends React.PureComponent<Props, State> {
    public static defaultProps: Partial<Props> = {
        location: Locations.CENTER,
        pluginMenuItems: [],
        appBindings: [],
    }
    private buttonRef: React.RefObject<HTMLButtonElement>;

    constructor(props: Props) {
        super(props);

        this.state = {
            openUp: false,
        };

        this.buttonRef = React.createRef<HTMLButtonElement>();
    }

    // listen to clicks/taps on add reaction menu item and pass to parent handler
    tooltip = (
        <Tooltip
            id='actions-menu-icon-tooltip'
            className='hidden-xs'
        >
            <FormattedMessage
                id='post_info.tooltip.actions'
                defaultMessage='Actions'
            />
        </Tooltip>
    )

    refCallback = (menuRef: Menu): void => {
        if (menuRef) {
            const buttonRect = this.buttonRef.current?.getBoundingClientRect();
            let y;
            if (typeof buttonRect?.y === 'undefined') {
                y = typeof buttonRect?.top == 'undefined' ? 0 : buttonRect?.top;
            } else {
                y = buttonRect?.y;
            }
            const windowHeight = window.innerHeight;

            const totalSpace = windowHeight - MENU_BOTTOM_MARGIN;
            const spaceOnTop = y - Constants.CHANNEL_HEADER_HEIGHT;
            const spaceOnBottom = (totalSpace - (spaceOnTop + Constants.POST_AREA_HEIGHT));

            this.setState({
                openUp: (spaceOnTop > spaceOnBottom),
            });
        }
    }

    handleOpenMarketplace = (): void => {
        const openMarketplaceData = {
            modalId: ModalIdentifiers.PLUGIN_MARKETPLACE,
            dialogType: MarketplaceModal,
        };
        this.props.actions.openModal(openMarketplaceData);
    };

    onClickAppBinding = async (binding: AppBinding): Promise<void> => {
        const {post, intl} = this.props;

        if (!binding.call) {
            return;
        }
        const context = createCallContext(
            binding.app_id,
            binding.location,
            this.props.post.channel_id,
            this.props.teamId,
            this.props.post.id,
            this.props.post.root_id,
        );
        const call = createCallRequest(
            binding.call,
            context,
            {
                post: AppExpandLevels.ALL,
            },
        );

        const res = await this.props.actions.doAppCall(call, AppCallTypes.SUBMIT, intl);

        if (res.error) {
            const errorResponse = res.error;
            const errorMessage = errorResponse.error || intl.formatMessage({
                id: 'apps.error.unknown',
                defaultMessage: 'Unknown error occurred.',
            });
            this.props.actions.postEphemeralCallResponseForPost(errorResponse, errorMessage, post);
            return;
        }

        const callResp = res.data!;
        switch (callResp.type) {
        case AppCallResponseTypes.OK:
            if (callResp.markdown) {
                this.props.actions.postEphemeralCallResponseForPost(callResp, callResp.markdown, post);
            }
            break;
        case AppCallResponseTypes.NAVIGATE:
        case AppCallResponseTypes.FORM:
            break;
        default: {
            const errorMessage = intl.formatMessage({
                id: 'apps.error.responses.unknown_type',
                defaultMessage: 'App response type not supported. Response type: {type}.',
            }, {
                type: callResp.type,
            });
            this.props.actions.postEphemeralCallResponseForPost(callResp, errorMessage, post);
        }
        }
    }

    visitMarketplaceTip(): React.ReactElement {
        return (
            <SystemPermissionGate
                permissions={[Permissions.MANAGE_SYSTEM]}
            >
                <div
                    style={{
                        textAlign: 'center',
                        margin: 12,
                        fontSize: 14,
                    }}
                >
                    <FormattedMarkdownMessage
                        id='post_info.actions.noActions'
                        defaultMessage='No Actions currently\nconfigured for this server'
                    />
                </div>
                <div
                    style={{
                        textAlign: 'center',
                        top: 1,
                        paddingTop: 10,
                        paddingBottom: 10,
                        paddingLeft: 16,
                        paddingRight: 16,
                        fontSize: 12,
                    }}
                >
                    <button
                        id='marketPlaceButton'
                        className='btn btn-primary'
                        onClick={this.handleOpenMarketplace}
                    >
                        {<i className='icon icon-view-grid-plus-outline'/>}
                        <FormattedMarkdownMessage
                            id='post_info.actions.visitMarketplace'
                            defaultMessage='Visit the Marketplace'
                        />
                    </button>
                </div>
            </SystemPermissionGate>
        );
    }

    render() {
        const isSystemMessage = PostUtils.isSystemMessage(this.props.post);
        const isMobile = Utils.isMobile();

        const pluginItems = this.props.pluginMenuItems?.
            filter((item) => {
                return item.filter ? item.filter(this.props.post.id) : item;
            }).
            map((item) => {
                if (item.subMenu) {
                    return (
                        <Menu.ItemSubMenu
                            key={item.id + '_pluginmenuitem'}
                            id={item.id}
                            postId={this.props.post.id}
                            text={item.text}
                            subMenu={item.subMenu}
                            action={item.action}
                            root={true}
                        />
                    );
                }
                return (
                    <Menu.ItemAction
                        key={item.id + '_pluginmenuitem'}
                        text={item.text}
                        onClick={() => {
                            if (item.action) {
                                item.action(this.props.post.id);
                            }
                        }}
                    />
                );
            }) || [];

        let appBindings = [] as JSX.Element[];
        if (this.props.appsEnabled && this.props.appBindings) {
            appBindings = this.props.appBindings.map((item) => {
                let icon: JSX.Element | undefined;
                if (item.icon) {
                    icon = (<img src={item.icon}/>);
                }

                return (
                    <Menu.ItemAction
                        text={item.label}
                        key={item.app_id + item.location}
                        onClick={() => this.onClickAppBinding(item)}
                        icon={icon}
                    />
                );
            });
        }

        const {formatMessage} = this.props.intl;

        let tutorialTip = null;
        if (this.props.showTutorialTip) {
            tutorialTip = (
                <ActionsTutorialTip/>
            );
        }
        const marketPlace = (
            <Menu.ItemAction
                id={`marketplace_icon_${this.props.post.id}`}
                show={true}
                text={formatMessage({id: 'post_info.marketplace', defaultMessage: 'App Marketplace'})}
                leftDecorator={<i className='icon icon-view-grid-plus-outline'/>}
                onClick={this.handleOpenMarketplace}
            />
        );

        if (typeof pluginItems !== 'undefined' && pluginItems.length === 0 && isSystemMessage) {
            return null;
        }

        if (!appBindings.length && !pluginItems.length && !this.props.isSysAdmin) {
            return null;
        }

        let menuItems = this.visitMarketplaceTip();
        if (appBindings.length || pluginItems.length) {
            menuItems = pluginItems && appBindings && marketPlace &&
            <Pluggable
                postId={this.props.post.id}
                pluggableName={PLUGGABLE_COMPONENT}
            />;
        }

        return (
            <MenuWrapper onToggle={this.props.handleDropdownOpened}>
                <OverlayTrigger
                    className='hidden-xs'
                    delayShow={500}
                    placement='top'
                    overlay={this.tooltip}
                    rootClose={true}
                >
                    <button
                        ref={this.buttonRef}
                        id={`${this.props.location}_button_${this.props.post.id}`}
                        aria-label={Utils.localizeMessage('post_info.dot_menu.tooltip.more_actions', 'Actions').toLowerCase()}
                        className={classNames('post-menu__item', {
                            'post-menu__item--active': this.props.isMenuOpen,
                        })}
                        type='button'
                        aria-expanded='false'
                    >
                        <i className={'icon icon-apps'}/>
                        {tutorialTip}
                    </button>
                </OverlayTrigger>
                <Menu
                    id={`${this.props.location}_dropdown_${this.props.post.id}`}
                    openLeft={true}
                    openUp={this.state.openUp}
                    ref={this.refCallback}
                    ariaLabel={Utils.localizeMessage('post_info.menuAriaLabel', 'Post extra options')}
                >
                    {menuItems}
                </Menu>
            </MenuWrapper>
        );
    }
}

export default injectIntl(ActionMenuClass);
