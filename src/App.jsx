import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MetaMaskCurrentAccount = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [contractBalance, setContractBalance] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const getAccount = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setCurrentAccount(accounts[0]);
          }
        } catch (error) {
          toast.error("Error fetching account");
          console.error("Error fetching account:", error);
        }
      } else {
        toast.error("MetaMask not installed");
        console.error("MetaMask not installed");
      }
    };

    getAccount();

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
      } else {
        setCurrentAccount('');
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const connectContract = async () => {
    const contractAddress = '0x359e65e9CcED227D3838434e421231ab6f0c2bA7';
    const abi = [
      {
        "inputs": [],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "get",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getbalance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contractInstance = new ethers.Contract(contractAddress, abi, signer);
    setContract(contractInstance);
    toast.success('Contract Connected Successfully');
  };

  const getBalance = async () => {
    try {
      const data = await contract.getbalance();
      setContractBalance(String(data));
      toast.success('Balance Fetched Successfully');
    } catch (error) {
      toast.error('Error fetching balance');
      console.error('Error fetching balance:', error);
    }
  };

  const sendEther = async () => {
    if (amount === '') {
      toast.error('Cannot send empty amount');
    } else {
      try {
        const tx = await contract.deposit({
          value: ethers.parseEther(amount)
        });
        await tx.wait();
        const balance = await contract.getbalance();
        setContractBalance(String(balance));
        toast.success('Transaction successful');
        console.log('Transaction successful:', tx);
      } catch (error) {
        toast.error('Error sending Ether');
        console.error('Error sending Ether:', error);
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-2xl rounded-3xl p-8 max-w-lg mx-auto transform transition-all hover:scale-105 hover:shadow-3xl">
        <ToastContainer />
        <h1 className="text-3xl font-extrabold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
          Current MetaMask Account
        </h1>
        <p className="text-center text-lg mb-4 text-gray-800">
          {currentAccount ? currentAccount : 'No account connected'}
        </p>
        <h1 className="text-xl font-semibold text-center mb-4 text-gray-700">
          Contract balance: {contractBalance} ETH
        </h1>
        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={connectContract}
            className="px-6 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
          >
            Connect Contract
          </button>
          <button
            onClick={getBalance}
            className="px-6 py-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105"
          >
            Get Balance
          </button>
        </div>
        <div className="flex flex-col items-center mb-4">
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to send"
            className="px-4 py-2 border rounded-full mb-2 w-full shadow-inner"
          />
          <button
            onClick={sendEther}
            className="px-6 py-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetaMaskCurrentAccount;
