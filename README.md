# How to 

```
make package
ll
pwd
mv /opt/mattermost/client /opt/mattermost/client.bak
tar xvzf mattermost-webapp.tar.gz  -C /opt/mattermost
ll /opt/mattermost/
chown mattermost:mattermost /opt/mattermost/client
systemctl restart mattermost
systemctl status mattermost
```
