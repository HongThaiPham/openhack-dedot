import { Stack } from '@chakra-ui/react';
import AccountList from './AccountList';
import ConnectButton from './ConnectButton';
import IdentityForm from './IdentityForm';

const OpenHack = () => {
  return (
    <Stack spacing={3}>
      <ConnectButton />
      <IdentityForm />
      {/* <AccountList /> */}
    </Stack>
  );
};

export default OpenHack;
