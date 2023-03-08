import React, { useState } from 'react';
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons"
import { Box, Tooltip, Button, Text, Menu, MenuButton, MenuList, Avatar, MenuItem, MenuDivider, Drawer, useDisclosure, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Input, useToast, Spinner } from "@chakra-ui/react";
import { ChatState } from '../../context/ChatProvider';
import { ProfileModal, ChatLoading, UserListItem } from '../';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SideDrawer = () => {
    const [search, setSearch] = useState();
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);

    const { user, setSelectedChat, chats, setChats } = ChatState();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const navigate = useNavigate();
    const toast = useToast();

    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        navigate("/");
    };

    const handleSearch = async () => {
        if (!search) {
            toast({
                title: "Please, enter somethin in search",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top-left"
            });
            return;
        };

        try {
            setLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };

            const { data } = await axios.get(`/api/user?search=${search}`, config);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: "Error occurred!",
                description: "Failed to load the search results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left"
            });
            console.log(error);
        } finally {
            setLoading(false);
        };
    };

    const accessChat = async (userId) => {
        try {
            setLoadingChat(true);

            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`
                }
            };

            const { data } = await axios.post("/api/chat", { userId }, config);

            if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
            setSelectedChat(data);
            onClose();
        } catch (error) {
            toast({
                title: "Error fetching the chat",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left"
            });
            console.log(error);
        } finally {
            setLoadingChat(false);
        };
    };

    return (
        <>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems={"center"}
                bg="white"
                w="100%"
                p="5px 10px 5px 10px"
                borderWidth={"5px"}
            >
                <Tooltip label="Search Users to chat" hasArrow placement='bottom-end'>
                    <Button variant="ghost" onClick={onOpen}>
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <Text display={{ base: "none", md: "flex" }} px="4">Search User</Text>
                    </Button>
                </Tooltip>
                <Text fontSize={"2xl"} fontFamily="Work sans">Chatify</Text>
                <div>
                    <Menu>
                        <MenuButton p={1}>
                            <BellIcon fontSize={"xl"} m={1} />
                        </MenuButton>
                        {/* <MenuList></MenuList> */}
                    </Menu>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                            <Avatar size={"sm"} cursor="pointer" name={user.name} src={user.pic} />
                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModal>
                            <MenuDivider />
                            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>

            <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth={"1px"}>Search Users</DrawerHeader>
                    <DrawerBody>
                        <Box display={"flex"} pb={2}>
                            <Input
                                placeholder='Search by name or email'
                                mr={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button onClick={handleSearch}>Go</Button>
                        </Box>
                        {
                            loading 
                                ? <ChatLoading />
                                : (
                                    searchResult?.map((user) => (
                                        <UserListItem
                                            key={user._id}
                                            user={user}
                                            handleFunction={() => accessChat(user._id)}
                                        />
                                    ))
                                )
                        }
                        { loadingChat && <Spinner ml={"auto"} display="flex" /> }
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    )
}

export default SideDrawer