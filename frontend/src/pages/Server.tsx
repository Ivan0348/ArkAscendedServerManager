import {
    Button,
    ButtonGroup,
    Card, DialogActions,
    DialogContent,
    DialogTitle,
    Divider, IconButton,
    Input,
    Modal,
    ModalDialog,
    Tab,
    TabList,
    Tabs, Tooltip
} from "@mui/joy";
import {Administration} from "./server/Administration";
import {General} from "./server/General";
import {useEffect, useState} from "react";
import {server} from "../../wailsjs/go/models";
import {
    CheckServerInstalled,
    ForceStopServer,
    GetServer, GetServerStatus,
    SaveServer,
    StartServer
} from "../../wailsjs/go/server/ServerController";
import {InstallUpdater} from "./InstallUpdater";
import {useAlert} from "../components/AlertProvider";
import {BrowserOpenURL, EventsOff, EventsOn} from "../../wailsjs/runtime";
import {IconAlertCircleFilled, IconExternalLink} from "@tabler/icons-react";
import {Console} from "./server/Console";
import {UpdaterModal} from "./UpdaterModal";
import {InstallUpdateVerify} from "../../wailsjs/go/installer/InstallerController";
import {SendRconCommand} from "../../wailsjs/go/helpers/HelpersController";
import {Settings} from "./server/Settings";
import { useTranslation } from 'react-i18next';


type Props = {
    id: number | undefined
    className?: string
}


export const Server = ({id, className}: Props) => {
    const defaultServer = new server.Server
    defaultServer.id = -1
    defaultServer.serverAlias = ""
    defaultServer.ipAddress = "0.0.0.0"



    const [serv, setServ] = useState<server.Server>(defaultServer)
    const [isInstalled, setIsInstalled] = useState(false)
    const [serverStatus, setServerStatus] = useState(false)
    const [forceStopModalOpen, setForceStopModalOpen] = useState(false)
    const [updaterModalOpen, setUpdaterModalOpen] = useState(false)
    const {addAlert} = useAlert()
    const { t } = useTranslation();

    //region useEffect land :)

    useEffect(() => {
        if (serv.id >= 0) {
            CheckServerInstalled(serv.id).then((val) => setIsInstalled(val)).catch((reason) => console.error(reason))
        }
    }, [serv]);

    useEffect(() => {
        if (id !== undefined) {
            GetServer(id).then((s) => {setServ(s)}).catch((reason) => console.error(reason))
        }
    }, [id]);

    useEffect(() => {
        if (serv.id >= 0) {
            SaveServer(serv).catch((reason) => {console.error(reason); addAlert(reason, "danger")})
        }
    }, [serv]);

    useEffect(() => {
        EventsOn("onServerExit", () => setServerStatus(false))
        return () => EventsOff("onServerExit")
    }, []);

    useEffect(() => {
        if (serv.id >= 0) {
            refreshServerStatus()
        }
    }, [serv]);

    //endregion

    function onServerStartButtonClicked() {

        if (serv.serverPath == "") {
            addAlert(t('server.alert.noServerPath'), "warning")
            return
        }

        if (serv.disableUpdateOnStart) {
            startServer()
        } else {
            setUpdaterModalOpen(true)
            InstallUpdateVerify(serv.serverPath).catch((err) => {
                addAlert(t('server.alert.failedUpdateInstall') + " " + err.message, "danger");
                setUpdaterModalOpen(false);
                console.error(err);
            }).then(() => {
                setUpdaterModalOpen(false);
                startServer()
            })
        }

    }

    function startServer() {
        StartServer(serv.id).catch((err) => {addAlert(err, "danger"); console.error(err)}).then(() => setTimeout(function () {
            refreshServerStatus()
        }, 200))
    }

    function onServerStopButtonClicked() {
        addAlert(t('server.alert.stopServer'), "neutral")
        SendRconCommand("saveworld", serv.ipAddress, serv.rconPort, serv.adminPassword)
            .then(() => {
                //send quit command
                SendRconCommand("doexit", serv.ipAddress, serv.rconPort, serv.adminPassword)
                    .catch((err) => addAlert(t('server.alert.errorExit')+ " " + err, "danger"));
            })
            .catch((err) => addAlert(t('server.alert.errorSave') + " " + err, "danger"));
    }

    function onServerForceStopButtonClicked() {
        ForceStopServer(serv.id).catch((err) => {addAlert(err, "danger"); console.error(err)}).then(() => setServerStatus(false))
    }

    function refreshServerStatus() {
        GetServerStatus(serv.id).catch((reason) => {console.error("serverstatus: " + reason); addAlert(reason, "danger")}).then((s) => {
            if (typeof s === "boolean") {
                setServerStatus(s)
            }
        })

    }

    if (id !== undefined) {
        return (
            <Card className={className}>
                {isInstalled? (<Tabs size="sm" className={'flex h-full w-full overflow-y-auto'}>
                    <div className={'h-16 flex w-full'}>
                        <div className="flex items-center">
                            <Input value={serv?.serverAlias} onChange={(e) => setServ((p) => ({ ...p, serverAlias: e.target.value }))}/>
                            <Tooltip title={t('server.tooltip')}>
                                <IconButton className="text-lg font-bold ml-2" onClick={() => BrowserOpenURL("file:///" + serv.serverPath)}><IconExternalLink/></IconButton>
                            </Tooltip>
                        </div>


                        <div className={'ml-auto my-auto mr-8'}>
                            <ButtonGroup aria-label="outlined primary button group">
                                <Button color={'success'} variant="solid" disabled={serverStatus} onClick={onServerStartButtonClicked}>{t('server.startServerButton')}</Button>
                                <Button color={'danger'} variant="solid" disabled={!serverStatus} onClick={onServerStopButtonClicked}>{t('server.stopServerButton')}</Button>
                                <Button color={'danger'} variant="solid" disabled={!serverStatus} onClick={() => setForceStopModalOpen(true)}>{t('server.forceStopServerButton')}</Button>
                            </ButtonGroup>

                            <UpdaterModal open={updaterModalOpen}  onCompleted={() => setUpdaterModalOpen(false)}></UpdaterModal>
                            <Modal open={forceStopModalOpen} onClose={() => setForceStopModalOpen(false)}>
                                <ModalDialog variant="outlined" role="alertdialog">
                                    <DialogTitle>
                                        <IconAlertCircleFilled/>
                                        {t('server.forceStopModal.forceStopDialogTitle')}
                                    </DialogTitle>
                                    <Divider />
                                    <DialogContent>
                                        <p>{t('server.forceStopModal.forceStopDialogContent')}</p>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button variant="solid" color="danger" onClick={() => {setForceStopModalOpen(false); onServerForceStopButtonClicked()}}>
                                            {t('server.forceStopModal.forceStopDialogActionButton')}
                                        </Button>
                                        <Button variant="plain" color="neutral" onClick={() => setForceStopModalOpen(false)}>
                                            {t('server.forceStopModal.forceStopDialogCancelButton')}
                                        </Button>
                                    </DialogActions>
                                </ModalDialog>
                            </Modal>
                        </div>
                    </div>
                    <TabList className={'w-full'}>
                        <Tab variant="plain" indicatorInset color="neutral">{t('server.tabListConsole')}</Tab>
                        <Tab variant="plain" indicatorInset color="neutral">{t('server.tabListGeneralSettings')} </Tab>
                        <Tab variant="plain" indicatorInset color="neutral">{t('server.tabListServerSettings')}</Tab>
                        <Tab variant="plain" indicatorInset color="neutral">{t('server.tabListAdministration')}</Tab>
                    </TabList>
                    <Console serv={serv} setServ={setServ} serverStatus={serverStatus}/>
                    <General serv={serv} setServ={setServ}/>
                    <Settings setServ={setServ} serv={serv}></Settings>
                    <Administration serv={serv} setServ={setServ} onServerFilesDeleted={() => CheckServerInstalled(serv.id).then((val) => setIsInstalled(val)).catch((reason) => console.error(reason))}/>
                </Tabs>) : (<InstallUpdater serv={serv} setServ={setServ} onInstalled={() => setIsInstalled(true)}/>)}
            </Card>
        );
    } else {
        return (
            <Card className={className}>
                <Tabs size="sm" className={'flex h-full w-full overflow-y-auto'}>
                    <div className={'h-16 flex w-full'}>
                        <p className={'text-lg font-bold ml-8'}>{t('server.noServerFoundSelected')}</p>
                    </div>
                </Tabs>
            </Card>
        );
    }
};
