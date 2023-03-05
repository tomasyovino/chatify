import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast } from "@chakra-ui/react"
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pic, setPic] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const postDetails = async (pics) => {
    setLoading(true);
    try {
      if (pic === undefined) {
        toast({
          title: "Please select an Image!",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom"
        });
        return;
      };
  
      if (pics.type === "image/jpeg" || pics.type === "image/png") {
        const form = new FormData();
        form.append("file", pics);
        form.append("upload_preset", "chatify");
        form.append("cloud_name", "dtyrld6tv");

        const data = await fetch("https://api.cloudinary.com/v1_1/dtyrld6tv/image/upload", {
          method: "POST",
          body: form
        });
        const response = await data.json();

        setPic(response.url.toString());
        console.log(response.url.toString());
      } else {
        toast({
          title: "Please select an Image!",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom"
        });
      };
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    };
  };

  const submitHandler = async () => {
    setLoading(true);
    try {
      if (!name || !email || !password || !confirmPassword) {
        toast({
          title: "Please fill all the fields",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom"
        });
        return;
      } else if (password !== confirmPassword) {
        toast({
          title: "Passwords do not match",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom"
        });
        return;
      };

      const config = {
        headers: {
          "Content-type": "application/json"
        }
      };

      const { data } = await axios.post("/api/user", { name, email, password, pic }, config);
      toast({
        title: "Registration is successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom"
      });

      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/chats')
    } catch (error) {
      toast({
        title: "Error occurred!",
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

  return (
    <VStack spacing="5px">
      <FormControl isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          name="firstName"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={ showPassword ? "text" : "password"}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={() => setShowPassword(!showPassword)}>
              { showPassword ? "Hide" : "Show" }
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            name="confirmPassword"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type={ showConfirmPassword ? "text" : "password"}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              { showConfirmPassword ? "Hide" : "Show" }
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl>
        <FormLabel>Upload your picture</FormLabel>
        <Input
          name="pic"
          type="file"
          p={1.5}
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </FormControl>

      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Sign Up
      </Button>
    </VStack>
  )
}

export default SignUp