import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DedotClient, WsProvider } from 'dedot';
import { WestendApi } from '@dedot/chaintypes';
import { WESTEND } from '../networks';
import { Injected, InjectedAccount, InjectedWindowProvider, InjectedWindow } from '@polkadot/extension-inject/types';
import { useToast } from '@chakra-ui/react';
import { FrameSystemAccountInfo } from 'dedot/chaintypes';

interface ContextState {
  dedotClient: DedotClient<WestendApi> | null;
  provider: InjectedWindowProvider | undefined;
  connectToSubWallet: () => Promise<void>;
  getConnectedAccounts: () => Promise<InjectedAccount[]>;
  getConnectedAccount: () => Promise<InjectedAccount | undefined>;
  isConnected: boolean;
  disconnectSubWallet: () => Promise<void>;
  getAccountBalance: (account: InjectedAccount) => Promise<FrameSystemAccountInfo | undefined>;
}

export const AppContext = createContext<ContextState>({
  dedotClient: null,
  provider: undefined,
  connectToSubWallet: async () => {},
  getConnectedAccounts: async () => [],
  getConnectedAccount: async () => undefined,
  isConnected: false,
  disconnectSubWallet: async () => {},
  getAccountBalance: async () => undefined,
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => useContext(AppContext);
type Props = {
  autoConnect?: boolean;
} & PropsWithChildren;
const AppProvider: React.FC<Props> = ({ children, autoConnect }) => {
  const toast = useToast();
  const [dedotClient, setDedotClient] = useState<DedotClient<WestendApi> | null>(null);
  const [injected, setInjected] = useState<Injected | null>(null);

  const InitClient = useCallback(async () => {
    if (!dedotClient) {
      const wsProvider = new WsProvider(WESTEND.endpoint);
      const client = new DedotClient<WestendApi>(wsProvider);
      await client.connect();
      setDedotClient(client);
    }
  }, [dedotClient]);

  const injectedWindow = window as Window & InjectedWindow;

  // Get subwallet-js injected provider to connect with SubWallet
  const provider: InjectedWindowProvider = injectedWindow.injectedWeb3['subwallet-js'];

  const connectToSubWallet = useCallback(async () => {
    // Connect with SubWallet from the dapp
    const injected: Injected = await provider.enable!('Open Hack Dapp');
    setInjected(injected);
    // console.log('Injected:', injected);
  }, [provider]);

  const getConnectedAccounts = async () => {
    if (!injected) return [];
    const accounts: InjectedAccount[] = await injected.accounts.get();
    // console.log('Accounts:', accounts);
    return accounts;
  };

  const getConnectedAccount = async () => {
    const accounts = await getConnectedAccounts();
    // console.log('Accounts:', accounts);
    return accounts[0];
  };

  const isConnected = useMemo(() => !!injected, [injected]);

  const disconnectSubWallet = useCallback(async () => {
    if (!injected) return;
    await injected.provider?.disconnect();
    setInjected(null);
  }, [injected]);

  const getAccountBalance = async (account: InjectedAccount) => {
    if (!dedotClient) return;
    const balance = await dedotClient.query.system.account(account.address);
    return balance;
  };

  useEffect(() => {
    toast.promise(InitClient(), {
      loading: { title: 'Initializing dedot client' },
      success: { title: 'Initialized dedot client' },
      error: { title: 'Failed to initialize dedot client' },
    });
    if (autoConnect) {
      connectToSubWallet();
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        dedotClient,
        provider,
        connectToSubWallet,
        getConnectedAccounts,
        isConnected,
        disconnectSubWallet,
        getAccountBalance,
        getConnectedAccount,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
