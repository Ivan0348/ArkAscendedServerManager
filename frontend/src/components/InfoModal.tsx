import React, {useEffect, useState} from "react";
import {AspectRatio, Button, Divider, IconButton, Modal, ModalClose, ModalDialog, Typography} from "@mui/joy";
import {IconInfoCircle} from "@tabler/icons-react";
import {BrowserOpenURL} from "../../wailsjs/runtime";
import banner from "../assets/AASM_V3_banner2.png"
import {GetVersion} from "../../wailsjs/go/helpers/HelpersController";

export const InfoModal = () => {

    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [appVersion, setAppVersion] = useState("");

    useEffect(() => {
        GetVersion().then(version => setAppVersion(version))

    }, []);

    return (
        <div>
            <IconButton
                variant="soft"
                color="neutral"
                onClick={() => setInfoModalOpen(true)}
            >
                <IconInfoCircle/>
            </IconButton>
            <Modal open={infoModalOpen} onClose={() => setInfoModalOpen(false)}>
                <ModalDialog>
                    <ModalClose/>
                    <AspectRatio minHeight="120px" sx={{margin: 2}} maxHeight="200px">
                        <img
                            src={banner}
                            loading="lazy"
                            alt="ASAserverManagerLogo"
                        />
                    </AspectRatio>
                    <Divider/>
                    <div className={"p-4"}>
                        <Typography level={"title-lg"}>
                            Info:
                        </Typography>
                        <Typography level={"body-sm"} className={"flex-grow"}>
                            Version: {appVersion}
                        </Typography>
                        <div style={{height: 200}}></div>
                        <Button color={"neutral"} sx={{margin: 1}} onClick={() => BrowserOpenURL("https://github.com/JensvandeWiel/ArkAscendedServerManager")}>GitHub</Button>
                        <Button color={"neutral"} sx={{margin: 1}} onClick={() => BrowserOpenURL("https://discord.gg/RmesnZ8FWf")}>Discord</Button>
                        <Button color={"neutral"} sx={{margin: 1}} onClick={() => BrowserOpenURL("https://github.com/sponsors/JensvandeWiel")}>Sponsor me</Button>
                    </div>
                </ModalDialog>
            </Modal>
        </div>
    );
}
