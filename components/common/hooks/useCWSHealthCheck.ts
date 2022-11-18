import { cwsHealthCheck } from 'mattermost-redux/actions/cloud';
import { Client4 } from 'mattermost-redux/client';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export default function useCWSHealthCheck() {

    const cwsHealthCheck = async () => {
        return await Client4.cwsHealthCheck()
    } 

    return {
        cwsHealthCheck
    }
}
