import React, {useEffect, useState} from "react";
import {server} from "../../wailsjs/go/models";
import {
    Button,
    Card,
    Divider,
    FormLabel,
    Input,
    LinearProgress,
    Modal,
    ModalDialog,
    Typography
} from "@mui/joy";
import {OpenDirectoryDialog} from "../../wailsjs/go/helpers/HelpersController";
import {IconDownload, IconTrash} from "@tabler/icons-react";
import {InstallUpdateVerify} from "../../wailsjs/go/installer/InstallerController";
import {EventsOn} from "../../wailsjs/runtime";
import {useAlert} from "../components/AlertProvider";
import {DeleteProfile} from "../../wailsjs/go/server/ServerController";
import { useTranslation } from 'react-i18next';

type Props = {
    setServ: React.Dispatch<React.SetStateAction<server.Server>>
    serv: server.Server;
    onInstalled: () => void;
}

export function InstallUpdater({setServ, serv, onInstalled}: Props) {

    const [action, setAction] = useState("Preparing")
    const [progress, setProgress] = useState(0.00)
    const [isCompleted, setIsCompleted] = useState(false)
    const [installerModalOpen, setInstallerModalOpen] = useState(false)
    const {addAlert} = useAlert()
    const { t } = useTranslation();

    function onServerPathClicked() {
        OpenDirectoryDialog().then((val) => setServ((p) => ({ ...p, serverPath: val, convertValues: p.convertValues })))
    }

    function onStartInstallButtonClicked() {
        if (serv.serverPath == "") {
            addAlert(t('installUpdater.alert.noServerPath'), "warning")
            return
        }
        setInstallerModalOpen(true)
        InstallUpdateVerify(serv.serverPath).catch((err) => {
            setAction("failed installing: " + err.message);
            setInstallerModalOpen(false);
            console.error(err);
            addAlert(t('installUpdater.alert.failedUpdateInstall') + " " + err, "danger")
        })
    }

    function onCancelButtonClicked() {
        DeleteProfile(serv.id).then(() => {addAlert("Deleted profile", "success"); setTimeout(() => {location.reload()}, 500) }).catch((err) => {console.error(err); addAlert(err, "danger")})
    }

    useEffect(() => {
        EventsOn("installingUpdateAction", (data) => {setAction(data);})
        EventsOn("installingUpdateProgress", (data) => {setProgress(data);})
        EventsOn("appInstalled", () => {setIsCompleted(true);  setAction("Done"); setProgress(100)})
    }, []);

    return (
        <div>
            <Modal open={installerModalOpen} >
                <ModalDialog>
                    <Typography level="title-md">
                        {t('installUpdater.installUpdateModal.title')}
                    </Typography>
                    <Divider className={'mx-2'}/>
                    <Typography fontWeight={700} level="title-md">
                        {t('installUpdater.installUpdateModal.status')} {action}
                    </Typography>
                    <Typography fontWeight={700} level="title-md">
                        {t('installUpdater.installUpdateModal.progress')}
                    </Typography>
                    <div className={'w-1/2 mt-4'}>
                        <LinearProgress determinate value={progress} />
                    </div>
                    <Button disabled={!isCompleted} onClick={() => {setInstallerModalOpen(false); setServ(serv); onInstalled()}} className={"w-2/12"}>
                        {t('installUpdater.installUpdateModal.backActionButton')}
                    </Button>
                </ModalDialog>
            </Modal>
            <Card variant="soft"  className={''}>
                <Typography level="title-md">
                    {t('installUpdater.installUpdateCard.title')}
                </Typography>
                <Divider className={'mx-2'}/>
                <FormLabel>{t('installUpdater.installUpdateCard.serverPath')}</FormLabel>
                <Input className={'w-1/3'} value={serv.serverPath} required onClick={onServerPathClicked} ></Input>
                <div className={"text-center"}>
                    <Button endDecorator={<IconDownload/>} onClick={onStartInstallButtonClicked}>{t('installUpdater.installUpdateCard.actionButton')}</Button>
                    <Button endDecorator={<IconTrash/>} onClick={onCancelButtonClicked} className={"mx-5"} color={"danger"}>{t('installUpdater.installUpdateCard.cancelButton')}</Button>
                </div>
            </Card>
        </div>
    );
}