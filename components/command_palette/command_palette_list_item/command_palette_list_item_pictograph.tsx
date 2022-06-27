// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import classNames from 'classnames';

import RenderEmoji from 'components/emoji/render_emoji';
import ProfilePicture from 'components/profile_picture';

export enum CmdPalettePictographType {
    IMAGE= 'image',
    ICON= 'icon',
    GOTO_ICON= 'goto_icon',
    EMOJI= 'emoji',
    TEXT= 'text',
}

export enum CmdPalettePictographIcon{
    ARCHIVE = 'icon-archive-outline',
    PENCIl = 'icon-pencil-outline',
    GLOBE = 'icon-globe',
    LOCK = 'icon-lock-outline',
}

export interface CmdPalettePictograph{
    type: CmdPalettePictographType;
    pictographItem: CmdPalettePictographIcon | string;
    userStatus?: string;
}

export const CommandPaletteListItemPictograph = ({type, pictographItem, userStatus}: CmdPalettePictograph) => {
    if (type === CmdPalettePictographType.ICON) {
        return <i className={classNames('cmd-pl-list-item__icon', pictographItem)}/>;
    } else if (type === CmdPalettePictographType.GOTO_ICON) {
        return <i className={classNames('cmd-pl-list-item__goto-icon', pictographItem)}/>;
    } else if (type === CmdPalettePictographType.TEXT) {
        return (
            <div className='cmd-pl-list-item__text'>
                {pictographItem}
            </div>
        );
    } else if (type === CmdPalettePictographType.IMAGE) {
        return (
            <ProfilePicture
                src={pictographItem}
                status={userStatus}
                size='sm'
            />);
    } else if (type === CmdPalettePictographType.EMOJI) {
        return (
            <RenderEmoji
                emojiName={pictographItem}
            />);
    }
    return null;
};
