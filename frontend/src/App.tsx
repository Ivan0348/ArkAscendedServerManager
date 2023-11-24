import {
    Button,
    DialogActions,
    DialogTitle, Divider,
    Drawer, IconButton, List, ListItem,
    ListItemButton,
    ModalClose, Tooltip,
} from "@mui/joy";
import {ThemeSwitcher} from "./components/ThemeSwitcher";
import {HomeButton} from "./components/HomeButton";
import {InfoModal} from "./components/InfoModal";
import { ServerList } from "./components/ServerList";
import React, {useEffect, useState} from "react";
import {Server} from "./pages/Server";
import {IconArrowLeft, IconExternalLink, IconPlus, IconRefresh} from "@tabler/icons-react";
import {
    CreateServer,
    GetAllServers,
    GetAllServersFromDir,
    GetServer,
    GetServerDir
} from "../wailsjs/go/server/ServerController";
import {server} from "../wailsjs/go/models";
import {BrowserOpenURL, EventsOff, EventsOn, LogDebug} from "../wailsjs/runtime";
import {AlertProvider} from "./components/AlertProvider";
import {LanguageSwitcher} from "./components/LanguageSwitcher";
import {useTranslation} from "react-i18next";

enum ServerListType {
    CARD,
    LIST,
}

function App() {
    const [activeServer, setActiveServer] = useState<number | undefined>(undefined)
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [servers, setServers] = useState<{[key: number]: server.Server}|null>(null);
    const { t } = useTranslation();

    //This gets all the servers but if one server is changed manually it does not update it!
    function getServers() {
        GetAllServers()
            .then(result => {
                if (typeof result === 'object') {
                    setServers(result);
                } else {
                    // Handle the case where the function returns a boolean.
                    LogDebug('GetAllServers status: ' + result)
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    function getServersFromDir() {
        GetAllServersFromDir()
            .then(result => {
                if (typeof result === 'object') {
                    setServers(result);
                    console.log(result)
                } else {
                    // Handle the case where the function returns a boolean.
                    LogDebug('GetAllServers status: ' + result)
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    useEffect(() => {
        getServers()
    }, []);

    useEffect(() => {
        EventsOn("reloadServers", getServers)
        return () => EventsOff("reloadServers")
    }, []);

    //events
    useEffect(() => {
        EventsOn("serverSaved", getServers)
        return () => {
            EventsOff("serverSaved")
        }
    }, []);


    const handleCreateNewServerClicked = () => {
        CreateServer(true).then((server) => {
            getServers()
            setActiveServer(server.id)
            setDrawerOpen(false)
        }).catch((r) => console.error(r))
    }

    const ServerDrawer = (
            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} size="md">
                <ModalClose/>

                <DialogTitle>{t('app.drawer.title')}</DialogTitle>
                <ServerList serverListType={ServerListType.LIST} servers={servers} setActiveServer={setActiveServer} setDrawerOpen={setDrawerOpen} handleCreateNewServerClicked={handleCreateNewServerClicked} />
                <Divider></Divider>
                <DialogActions>
                    <List>
                        <ListItem>
                            <Tooltip title={t('app.drawer.tooltip.reloadDisk')}><IconButton  color={'danger'} variant={"solid"}  onClick={() => {getServersFromDir(); setActiveServer(undefined)}}><IconRefresh/></IconButton></Tooltip>
                            <Tooltip title={t('app.drawer.tooltip.reloadCache')}><IconButton onClick={() => {getServers(); setActiveServer(undefined)}}><IconRefresh/></IconButton></Tooltip>
                            <Tooltip title={t('app.drawer.tooltip.openServerFolder')}><IconButton onClick={() => {GetServerDir().then((dir: string) => BrowserOpenURL("file:///" + dir))}}><IconExternalLink/></IconButton></Tooltip>
                        </ListItem>
                        <ListItem>
                            <ListItemButton onClick={handleCreateNewServerClicked}>
                                <IconPlus/> {t('app.drawer.actionButton')}
                            </ListItemButton>
                        </ListItem>
                    </List>
                </DialogActions>
            </Drawer>
    );

    let mainUi = null;
    if (activeServer !== undefined) {
        mainUi = <Server id={activeServer} className={'row-span-5 m-5'}/>
    } else {
        if(servers !== null && Object.keys(servers).length > 0) {
            mainUi = (
                <div className={'row-span-5 m-5'}>
                    <h2>{t('app.mainUi.title')}</h2>
                    <ServerList serverListType={ServerListType.CARD} servers={servers} setActiveServer={setActiveServer} setDrawerOpen={setDrawerOpen} handleCreateNewServerClicked={handleCreateNewServerClicked} />
                </div>
            )
        }
        else {
            mainUi = (
                <div className={'row-span-5 m-5'}>
                    <h2>{t('app.mainUi.noServers')}</h2>
                    <Button onClick={() => handleCreateNewServerClicked()}><IconPlus/>{t('app.mainUi.actionButton')}</Button>
                </div>
            )
        }
    }

    return (
        <div className={'min-h-screen max-h-screen overflow-y-auto flex-col flex'}>
            <AlertProvider>
                <div className={'h-16 flex'}>
                    <div className={'text-lg font-bold ml-8 my-auto'}>
                        <Button color={'neutral'} variant={'soft'} onClick={() => setDrawerOpen(true)}>
                            <IconArrowLeft/> {t('app.backButton')}
                        </Button>
                    </div>
                    <div className={'ml-auto my-auto mr-8 gap-2 flex'}>
                        <LanguageSwitcher/>
                        <ThemeSwitcher/>
                        <HomeButton setServ={setActiveServer}/>
                        <InfoModal/>
                    </div>
                </div>
                {mainUi}

                {ServerDrawer}
            </AlertProvider>
        </div>
    )
}

export default App
