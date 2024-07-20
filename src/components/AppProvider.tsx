import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DedotClient, WsProvider } from 'dedot';
import { WestendApi, WestendPeopleApi } from '@dedot/chaintypes';
import { WESTEND, WESTEND_PEOPLE } from '../networks';
import { Injected, InjectedAccount, InjectedWindowProvider, InjectedWindow } from '@polkadot/extension-inject/types';
import { Link, useToast } from '@chakra-ui/react';
import { FrameSystemAccountInfo } from 'dedot/chaintypes';

interface ContextState {
  dedotClient: DedotClient<WestendPeopleApi> | null;
  provider: InjectedWindowProvider | undefined;
  connectToSubWallet: () => Promise<void>;
  getConnectedAccounts: () => Promise<InjectedAccount[]>;
  getConnectedAccount: () => Promise<InjectedAccount | undefined>;
  isConnected: boolean;
  disconnectSubWallet: () => Promise<void>;
  getAccountBalance: (account: InjectedAccount) => Promise<FrameSystemAccountInfo | undefined>;
  setOnchainIdentity: (display: string, email: string, discord: string) => Promise<void>;
  getOnchainIdentity: (account?: InjectedAccount) => Promise<any>;
  transfer: (to: string, amount?: number) => Promise<void>;
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
  setOnchainIdentity: async () => {},
  getOnchainIdentity: async () => {},
  transfer: async () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => useContext(AppContext);
type Props = {
  autoConnect?: boolean;
} & PropsWithChildren;
const AppProvider: React.FC<Props> = ({ children, autoConnect }) => {
  const toast = useToast();
  const [dedotClient, setDedotClient] = useState<DedotClient<WestendPeopleApi> | null>(null);
  const [injected, setInjected] = useState<Injected | null>(null);

  const InitClient = useCallback(async () => {
    if (!dedotClient) {
      const wsProvider = new WsProvider(WESTEND_PEOPLE.endpoint);
      const client = new DedotClient<WestendPeopleApi>(wsProvider);
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

  const setOnchainIdentity = async (display: string, email: string, discord: string) => {
    if (!dedotClient) return;
    const connectedAccount = await getConnectedAccount();

    const tx = dedotClient.tx.identity.setIdentity({
      display: { type: 'Raw', value: display },
      email: { type: 'Raw', value: email },
      discord: { type: 'Raw', value: discord },
      image: { type: 'None' },
      legal: { type: 'None' },
      web: { type: 'None' },
      matrix: { type: 'None' },
      twitter: { type: 'None' },
      github: { type: 'None' },
    });
    toast.promise(
      new Promise<void>((resolve, reject) => {
        tx.signAndSend(
          connectedAccount.address,
          {
            signer: injected?.signer,
          },
          (result) => {
            console.log(result.status);

            // 'BestChainBlockIncluded': Transaction is included in the best block of the chain
            // 'Finalized': Transaction is finalized
            if (result.status.type === 'BestChainBlockIncluded' || result.status.type === 'Finalized') {
              if (result.dispatchError) {
                // Transaction is included but has an error
                const error = `${JSON.stringify(Object.values(result.dispatchError))}`;
                console.log('Error:', error);
                reject(error);
              } else {
                // Transaction is included and executed successfully
                toast({
                  title: 'Transaction sent',
                  description: (
                    <Link href={`https://westend.subscan.io/extrinsic/${result.txHash}`} isExternal>
                      View on Subscan
                    </Link>
                  ),
                  status: 'info',

                  isClosable: true,
                });
                resolve();
              }
            }
          },
        );
      }),
      {
        loading: { title: 'Updating onchain identity' },
        success: { title: 'Update onchain successfully' },
        error: { title: 'Failed to update onchain identity' },
      },
    );
  };

  const getOnchainIdentity = async (account?: InjectedAccount) => {
    if (!dedotClient) return;
    if (!account) {
      account = await getConnectedAccount();
    }
    const identity = await dedotClient.query.identity.identityOf(account.address);
    return identity ? identity[0].info : null;
  };

  const transfer = async (to: string, amount: number = 0.01) => {
    if (!dedotClient || !injected) return;
    const connectedAccount = await getConnectedAccount();
    const amountToTransfer: bigint = (BigInt(amount * 1000) * BigInt(Math.pow(10, WESTEND.decimals))) / BigInt(1000);
    toast.promise(
      new Promise<void>((resolve, reject) => {
        dedotClient.tx.balances
          .transferKeepAlive(to, amountToTransfer)
          .signAndSend(connectedAccount.address, { signer: injected.signer }, (result) => {
            console.log(result.status);
            console.log(result);

            // 'BestChainBlockIncluded': Transaction is included in the best block of the chain
            // 'Finalized': Transaction is finalized
            if (result.status.type === 'BestChainBlockIncluded' || result.status.type === 'Finalized') {
              if (result.dispatchError) {
                // Transaction is included but has an error
                const error = `${JSON.stringify(Object.values(result.dispatchError))}`;
                reject(error);
              } else {
                // Transaction is included and executed successfully
                toast({
                  title: 'Transaction sent',
                  description: (
                    <Link href={`https://westend.subscan.io/extrinsic/${result.txHash}`} isExternal>
                      View on Subscan
                    </Link>
                  ),
                  status: 'info',

                  isClosable: true,
                });
                resolve();
              }
            }
          });
      }),
      {
        loading: { title: 'Transferring' },
        success: { title: 'Transfer successfully' },
        error: { title: 'Failed to transfer' },
      },
    );
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
        setOnchainIdentity,
        getOnchainIdentity,
        transfer,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
