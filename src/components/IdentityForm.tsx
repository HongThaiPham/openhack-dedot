import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useAppContext } from './AppProvider';
import { useEffect, useState } from 'react';

const IdentityForm = () => {
  const toast = useToast();
  const { setOnchainIdentity, getOnchainIdentity, isConnected } = useAppContext();
  const [display, setDisplay] = useState('');
  const [email, setEmail] = useState('');
  const [discord, setDiscord] = useState('');

  useEffect(() => {
    getOnchainIdentity().then((identity) => {
      if (identity) {
        setDisplay(identity.display.value || '');
        setEmail(identity.email.value || '');
        setDiscord(identity.discord.value || '');
      }
    });
  }, [getOnchainIdentity]);

  const handleSubmit = async () => {
    if (!display || !email || !discord) {
      toast({
        title: 'Error',
        description: 'All fields are required',
        status: 'error',
        isClosable: true,
      });

      return;
    }

    await setOnchainIdentity(display, email, discord);
  };

  if (!isConnected) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <Text fontSize='lg' as='b'>
          Onchain Identity
        </Text>
      </CardHeader>
      <CardBody>
        <Stack spacing={3}>
          <FormControl isRequired>
            <FormLabel>Display name</FormLabel>
            <Input type='text' onChange={(e) => setDisplay(e.target.value)} value={display} />
            <FormHelperText>This name will be displayed on your onchain identity.</FormHelperText>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type='email' onChange={(e) => setEmail(e.target.value)} value={email} />
            <FormHelperText>This email will be displayed on your onchain identity.</FormHelperText>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Discord handle</FormLabel>
            <Input type='text' onChange={(e) => setDiscord(e.target.value)} value={discord} />
            <FormHelperText>This discord handle will be displayed on your onchain identity.</FormHelperText>
          </FormControl>
        </Stack>
      </CardBody>
      <CardFooter>
        <Button onClick={handleSubmit} colorScheme='green'>
          Submit
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IdentityForm;
