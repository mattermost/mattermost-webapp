import React, {useEffect, useState, memo} from 'react';
import {Client4} from 'mattermost-redux/client';

const SystemInfo = () => {
    const [systemInfo, setSystemInfo] = useState<any>(null)
    useEffect(() => {
        const interval = setInterval(() => {
            Client4.getDebugBarSystemInfo().then((result) => {
                setSystemInfo(result)
            })
        }, 1000)
        return () => {
            clearInterval(interval)
        }
    }, [])
    return (
        <div>
            <h2>System Info</h2>
            {JSON.stringify(systemInfo)}
        </div>
    )
}

export default memo(SystemInfo)
