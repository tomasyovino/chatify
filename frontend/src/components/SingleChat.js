import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { getSender, getSenderFull } from '../config/ChatLogics';
import { ChatState } from '../context/ChatProvider';
import { ProfileModal, UpdateGroupChatModal, ScrollableChat } from './';
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

import io from "socket.io-client";
const ENDPOINT = "http://localhost:5000";
let socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState();
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();
    const toast = useToast();

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

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

            socket.emit("join chat", selectedChat._id);
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
        socket.emit("stop typing", selectedChat._id)
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

                socket.emit("new message", data);
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
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));

        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        fetchMessages();

        selectedChatCompare = selectedChat;

        // eslint-disable-next-line
    }, [selectedChat]);

    useEffect(() => {
        socket.on("message received", (newMessageReceived) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
                if (!notification?.includes(newMessageReceived)) {
                    setNotification([newMessageReceived, ...notification]);
                    setFetchAgain(!fetchAgain);
                };
            } else {
                setMessages([...messages, newMessageReceived]);
            };
        });
    });
    
    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id)
        };

        let lastTypingTime = new Date().getTime();
        let timerLength = 3000;
        setTimeout(() => {
            let timeNow = new Date().getTime();
            let timeDifference = timeNow - lastTypingTime;

            if (timeDifference >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            };
        }, timerLength);
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

                            <FormControl onKeyDown={sendMessage} isRequired aria-autocomplete='none' mt={3}>
                                {
                                    isTyping
                                        ?
                                            <Lottie
                                                options={defaultOptions}
                                                height={50}
                                                width={70}
                                                style={{ marginBottom: 15, marginLeft: 0 }}
                                            />
                                        :   <></>
                                }
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