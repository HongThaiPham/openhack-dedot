import React, { useEffect, useState } from 'react';
import { useAppContext } from './AppProvider';
import { InjectedAccount } from '@polkadot/extension-inject/types';

type Props = {};

const AccountList: React.FC<Props> = ({}) => {
  const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
  const { isConnected, getConnectedAccount } = useAppContext();

  useEffect(() => {
    getConnectedAccount().then((accounts) => {
      setAccounts(accounts);
    });
  }, [getConnectedAccount]);

  return (
    <div>
      {isConnected ? (
        <>
          <h2>Account list</h2>
          <div>{JSON.stringify(accounts)}</div>
        </>
      ) : (
        <h2>Connect to SubWallet to see account list</h2>
      )}
    </div>
  );
};

export default AccountList;
