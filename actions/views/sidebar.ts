import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {switchToChannel} from './channel';
import {GlobalState} from '../../types/store';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {getHistory} from '../../utils/browser_history';

export function switchToSidebarStaticItem(id: string) {
    return (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState() as GlobalState;
        const teamUrl = getCurrentRelativeTeamUrl(state);
        getHistory().push(`${teamUrl}/${id}`);

        return {data: true};
    };
}
