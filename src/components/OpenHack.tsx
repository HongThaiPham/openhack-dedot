import { Stack } from '@chakra-ui/react';
import AccountList from './AccountList';
import ConnectButton from './ConnectButton';

const OpenHack = () => {
  return (
    <Stack spacing={3}>
      <ConnectButton />
      <AccountList />
    </Stack>
  );
};

export default OpenHack;
