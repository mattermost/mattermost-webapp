import { Client4 } from 'mattermost-redux/client';

export default function useCWSHealthCheck() {

    const cwsHealthCheck = async () => {
        return Client4.cwsHealthCheck()
    } 

    return {
        cwsHealthCheck
    }
}