import { useEffect, useState } from 'react';
import { useAppContext } from './AppProvider';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { Box, Button, Card, CardBody, CardHeader, Stack, Text } from '@chakra-ui/react';
import { formatBalance } from '../utils';
import { WESTEND } from '../networks';

const ConnectedAcount = () => {
  const { getConnectedAccount, disconnectSubWallet, getAccountBalance } = useAppContext();
  const [account, setAccount] = useState<InjectedAccount | undefined>(undefined);
  const [balance, setBalance] = useState<bigint | undefined>(undefined);

  useEffect(() => {
    getConnectedAccount().then((acc) => {
      setAccount(acc);
    });
  }, [getConnectedAccount]);

  useEffect(() => {
    if (!account) return;
    getAccountBalance(account).then((balance) => {
      setBalance(balance?.data.free);
    });
  }, [account, getAccountBalance]);

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader>Connected Account</CardHeader>
        <CardBody>
          <Box>
            Name:{' '}
            <Text color={'green'} as='b'>
              {account?.name}
            </Text>
          </Box>
          <Box>
            Address:{' '}
            <Text color={'orange'} as='b'>
              {account?.address}
            </Text>
          </Box>
          <Box>
            Balance:{' '}
            <Text color={'red'} fontSize={'lg'} as='b'>
              {balance ? formatBalance(balance, WESTEND.decimals) : 'loading ...'}
            </Text>
          </Box>
        </CardBody>
      </Card>

      <Button onClick={() => disconnectSubWallet()} colorScheme={'red'}>
        Disconnect
      </Button>
    </Stack>
  );
};

export default ConnectedAcount;
