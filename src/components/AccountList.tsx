import { useEffect, useState } from 'react';
import { useAppContext } from './AppProvider';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { WESTEND } from '../networks';
import { formatBalance } from '../utils';

const AccountList = () => {
  const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { isConnected, getConnectedAccounts: getConnectedAccount } = useAppContext();

  useEffect(() => {
    getConnectedAccount().then((accounts) => {
      setAccounts(accounts);
      setLoading(false);
    });
  }, [getConnectedAccount]);

  return (
    <div>
      {isConnected ? (
        <Card>
          <CardHeader>
            <Heading size='md'>Account list</Heading>
          </CardHeader>

          <CardBody>
            {loading ? (
              <Alert status='info'>
                <AlertIcon />
                Loading accounts...
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Address</Th>
                      <Th>Balance</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {accounts.map((account, index) => (
                      <AccountListRow key={index} account={account} />
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>
      ) : (
        <Alert status='error'>
          <AlertIcon />
          <AlertTitle>Connect to SubWallet to see account list</AlertTitle>
        </Alert>
      )}
    </div>
  );
};

const AccountListRow = ({ account }: { account: InjectedAccount }) => {
  const { getAccountBalance } = useAppContext();
  const [balance, setBalance] = useState<bigint | undefined>(undefined);
  useEffect(() => {
    getAccountBalance(account).then((balance) => {
      console.log('Balance:', balance);
      setBalance(balance?.data.free);
    });
  }, [account, getAccountBalance]);
  return (
    <Tr>
      <Td>{account.name}</Td>
      <Td>{account.address}</Td>
      <Th>{balance ? formatBalance(balance, WESTEND.decimals) : 'loading ...'}</Th>
    </Tr>
  );
};

export default AccountList;
