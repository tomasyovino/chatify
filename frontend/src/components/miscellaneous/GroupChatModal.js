import { FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast, Button, Box } from '@chakra-ui/react';
import axios from 'axios';
import { useState } from 'react';
import { ChatState } from '../../context/ChatProvider';
import { UserListItem, UserBadgeItem } from '../';

const GroupChatModal = ({ children }) => {
    const [groupChatName, setGroupChatName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const { user, chats, setChats } = ChatState();

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) return;

        try {
            setLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };

            const { data } = await axios.get(`/api/user?search=${search}`, config);
            setSearchResults(data);
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

    const handleGroup = (userToAdd) => {
        if (selectedUsers.includes(userToAdd)) {
            toast({
                title: "User already added",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top"
            });
            return;
        };

        setSelectedUsers([...selectedUsers, userToAdd]);
    };

    const handleDelete = (deleteUser) => {
        setSelectedUsers(selectedUsers.filter((user) => user._id !== deleteUser._id));
    };
    
    const handleSubmit = async () => {
        if (!groupChatName || !selectedUsers) {
            toast({
                title: "Please fill all the fields",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top"
            });
            return;
        };

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };

            const { data } = await axios.post(
                "/api/chat/group",
                {
                    name: groupChatName,
                    users: JSON.stringify(selectedUsers.map(u => u._id))
                },
                config
            );

            setChats([data, ...chats]);
            onClose();

            toast({
                title: "New group chat created",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });
        } catch (error) {
            toast({
                title: "Failed to create the chat group",
                description: error.response.data,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left"
            });
            console.log(error);
        };
    };

    return (
        <>
            <span onClick={onOpen}>{children}</span>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize={"35px"}
                        fontFamily={"Work sans"}
                        display={"flex"}
                        justifyContent="center"
                    >
                        Create Group Chat
                    </ModalHeader>
                    <ModalCloseButton />

                    <ModalBody display={"flex"} flexDir="column" alignItems="center">
                        <FormControl>
                            <Input placeholder='Chat name' mb={3} onChange={(e) => setGroupChatName(e.target.value)} />
                        </FormControl>
                        <FormControl>
                            <Input placeholder='Add users ex: John, Noah, Jane' mb={1} onChange={(e) => handleSearch(e.target.value)} />
                        </FormControl>
                        
                        <Box w="100%" display="flex" flexWrap="wrap">
                            {
                                selectedUsers.map((user) => (
                                    <UserBadgeItem key={user._id} user={user} handleFunction={() => handleDelete(user)} />
                                ))
                            }
                        </Box>

                        {
                            loading
                                ? <div>loading</div>
                                : searchResults?.slice(0, 4).map((user) => (
                                    <UserListItem key={user._id} user={user} handleFunction={() => handleGroup(user)} />
                                ))
                        }
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" onClick={handleSubmit}>Create Chat</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default GroupChatModal;