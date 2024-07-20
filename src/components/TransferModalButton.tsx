import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useAppContext } from './AppProvider';

const TransferModalButton = () => {
  const { transfer } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [to, setTo] = useState('5GTH6Mo6mKr2fBESmziVUnHA2E1JHQ9DGQbgZeQiuCHFCwA1');
  const [amount, setAmount] = useState(0.01);
  const handleTransfer = async () => {
    await transfer(to, amount);
    setIsOpen(false);
  };
  return (
    <>
      <Button onClick={() => setIsOpen(true)} colorScheme={'green'}>
        Transfer
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transfer form</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Destination address</FormLabel>
              <Input
                placeholder='5GTH6Mo6mKr2fBESmziVUnHA2E1JHQ9DGQbgZeQiuCHFCwA1'
                onChange={(e) => setTo(e.target.value)}
                value={to}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Amount</FormLabel>
              <Input
                type='number'
                placeholder='0.01'
                onChange={(e) => setAmount(Number(e.target.value))}
                value={amount}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={handleTransfer}>
              Save
            </Button>
            <Button onClick={() => setIsOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TransferModalButton;
