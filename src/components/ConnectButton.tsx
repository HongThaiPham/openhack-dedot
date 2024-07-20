import React from 'react';
import { useAppContext } from './AppProvider';
import { Button } from '@chakra-ui/react';

const ConnectButton = () => {
  const { connectToSubWallet } = useAppContext();
  return <Button onClick={() => connectToSubWallet()}> Connect to SubWallet</Button>;
};

export default ConnectButton;
