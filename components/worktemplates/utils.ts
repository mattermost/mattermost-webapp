// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {WorkTemplate} from '@mattermost/types/worktemplates';

export function getTemplateDefaultIllustration(template: WorkTemplate): [string, string] {
    const channels = template.content.filter((c) => c.channel).map((c) => c.channel!);
    if (channels.length) {
        return ['channels', channels[0].illustration];
    }
    if (template.description.channel.illustration) {
        return ['channels', template.description.channel.illustration];
    }

    const boards = template.content.filter((c) => c.board).map((c) => c.board!);
    if (boards.length) {
        return ['boards', boards[0].illustration];
    }
    if (template.description.board.illustration) {
        return ['boards', template.description.board.illustration];
    }

    const playbooks = template.content.filter((c) => c.playbook).map((c) => c.playbook!);
    if (playbooks.length) {
        return ['playbooks', playbooks[0].illustration];
    }
    if (template.description.playbook.illustration) {
        return ['playbooks', template.description.playbook.illustration];
    }

    return ['', ''];
}

