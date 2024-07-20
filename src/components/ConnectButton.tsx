import { useAppContext } from './AppProvider';
import { Alert, AlertIcon, Box, Button, Stack, Text } from '@chakra-ui/react';
import ConnectedAcount from './ConnectedAccount';

const ConnectButton = () => {
  const { connectToSubWallet, isConnected } = useAppContext();

  if (!isConnected)
    return (
      <Stack spacing={3}>
        <Alert status='info'>
          <AlertIcon />
          Not connected to SubWallet
        </Alert>
        <Button onClick={() => connectToSubWallet()}> Connect to SubWallet</Button>
      </Stack>
    );
  return <ConnectedAcount />;
};

export default ConnectButton;
