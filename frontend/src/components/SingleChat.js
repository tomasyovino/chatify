import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { getSender, getSenderFull } from '../config/ChatLogics';
import { ChatState } from '../context/ChatProvider';
import { ProfileModal, UpdateGroupChatModal, ScrollableChat } from './';

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState();

    const { user, selectedChat, setSelectedChat } = ChatState();
    const toast = useToast();

    const fetchMessages = async (event) => {
        if (!selectedChat) return;
        
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };
            
            const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
            setMessages(data);
        } catch (error) {
            toast({
                title: "Error occurred",
                description: "Failed to load the messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });
            console.log(error);
        } finally {
            setLoading(false);
        };
    };

    const sendMessage = async (event) => {
        if (event.key === "Enter" && newMessage) {
            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`
                    }
                };

                const { data } = await axios.post(
                    "/api/message",
                    {
                        content: newMessage,
                        chatId: selectedChat._id
                    },
                    config
                );

                setMessages([...messages, data]);
            } catch (error) {
                toast({
                    title: "Error occurred",
                    description: "Failed to send the message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom"
                });
                console.log(error);
            } finally {
                setNewMessage("");
            };
        };
    };

    useEffect(() => {
        fetchMessages();
    }, [selectedChat]);

    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        // Typing indicator logic
    };

    return (
        <>
            {
                selectedChat
                    ? <>
                        <Text
                            fontSize={{ base: "28px", md: "30px" }}
                            pb={3}
                            px={2}
                            w="100%"
                            fontFamily={"Work sans"}
                            display="flex"
                            justifyContent={{ base: "space-between" }}
                            alignItems="center"
                        >
                            <IconButton
                                display={{ base: "flex", md: "none" }}
                                icon={<ArrowBackIcon />}
                                onClick={() => setSelectedChat("")}
                            />
                            {
                                !selectedChat.isGroupChat
                                    ? <>
                                        {getSender(user, selectedChat.users)}
                                        <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                                    </>
                                    : <>
                                        {selectedChat.chatName.toUpperCase()}
                                        <UpdateGroupChatModal
                                            fetchAgain={fetchAgain}
                                            setFetchAgain={setFetchAgain}
                                            fetchMessages={fetchMessages}
                                        />
                                    </>
                            }
                        </Text>
                        <Box
                            display={"flex"}
                            flexDir="column"
                            justifyContent={"flex-end"}
                            p={3}
                            bg="#E8E8E8"
                            w={"100%"}
                            h="100%"
                            borderRadius={"lg"}
                            overflowY="hidden"
                        >
                            {
                                loading
                                    ? <Spinner
                                        size={"xl"}
                                        w={20}
                                        h={20}
                                        alignSelf="center"
                                        margin={"auto"}
                                    />
                                    : <div className='messages'>
                                        <ScrollableChat messages={messages} />
                                    </div>
                            }

                            <FormControl onKeyDown={sendMessage} isRequired aria-autocomplete='off' mt={3}>
                                <Input
                                    variant={"filled"}
                                    bg="#E0E0E0"
                                    placeholder='Enter a message...'
                                    onChange={typingHandler}
                                    value={newMessage}
                                />
                            </FormControl>
                        </Box>
                    </>
                    : <Box display={"flex"} alignItems="center" justifyContent={"center"} h="100%">
                        <Text fontSize={"3xl"} pb={3} fontFamily="Work sans">
                            Click on an user to start chatting
                        </Text>
                    </Box>
            }
        </>
    );
};

export default SingleChat;