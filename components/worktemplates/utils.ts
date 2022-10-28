// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {WorkTemplate} from '@mattermost/types/worktemplates';

export function getTemplateDefaultIllustration(template: WorkTemplate): string {
    const channels = template.content.filter((c) => c.channel).map((c) => c.channel!);
    if (channels.length > 0) {
        return channels[0].illustration;
    }
    if (template.description.channel.illustration) {
        return template.description.channel.illustration;
    }

    const boards = template.content.filter((c) => c.board).map((c) => c.board!);
    if (boards.length > 0) {
        return boards[0].illustration;
    }
    if (template.description.board.illustration) {
        return template.description.board.illustration;
    }

    const playbooks = template.content.filter((c) => c.playbook).map((c) => c.playbook!);
    if (playbooks.length > 0) {
        return playbooks[0].illustration;
    }
    if (template.description.playbook.illustration) {
        return template.description.playbook.illustration;
    }

    return '';
}

