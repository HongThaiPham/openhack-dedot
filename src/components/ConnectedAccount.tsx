import { useEffect, useState } from 'react';
import { useAppContext } from './AppProvider';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { Box, Button, Card, CardBody, CardFooter, CardHeader, HStack, Stack, Text } from '@chakra-ui/react';
import { formatBalance } from '../utils';
import { WESTEND } from '../networks';
import { FrameSystemAccountInfo } from 'dedot/chaintypes';
import TransferModalButton from './TransferModalButton';

const ConnectedAcount = () => {
  const { getConnectedAccount, disconnectSubWallet, dedotClient, transfer } = useAppContext();
  const [account, setAccount] = useState<InjectedAccount | undefined>(undefined);
  const [balance, setBalance] = useState<bigint | undefined>(undefined);

  useEffect(() => {
    getConnectedAccount().then((acc) => {
      setAccount(acc);
    });
  }, [getConnectedAccount]);

  useEffect(() => {
    if (!dedotClient || !account) return;
    let unsub: any;
    (async () => {
      unsub = await dedotClient?.query.system.account(account.address, (balance: FrameSystemAccountInfo) => {
        setBalance(balance?.data.free);
      });
    })();
    return () => {
      unsub && unsub();
    };
  }, [account, dedotClient]);

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader>
          <Text fontSize='lg' as='b'>
            Connected Account
          </Text>
        </CardHeader>
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
        <CardFooter>
          <HStack spacing={3}>
            <TransferModalButton />
            <Button onClick={() => disconnectSubWallet()} colorScheme={'red'}>
              Disconnect
            </Button>
          </HStack>
        </CardFooter>
      </Card>
    </Stack>
  );
};

export default ConnectedAcount;
