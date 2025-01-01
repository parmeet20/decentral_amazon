"use client";

import React, { useState, useEffect } from "react";
import Web3 from "web3";
import Navbar from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardFooter, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import DAPPazonABI from "@/abis/Dappazon.json"; // Your contract ABI
import { blockAddress } from "@/block_address";

const DAPPazonAddress = blockAddress; // Your contract address

interface Item {
  id: number;
  name: string;
  category: string;
  image: string;
  rating: number;
  price: number;
  stock: number;
}

const Page = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [dappazonContract, setDappazonContract] = useState<any>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [events, setEvents] = useState<any[]>([]); // Store Buy events
  const [hasBought, setHasBought] = useState<boolean>(false); // State to track if purchase is made

  // Initialize Web3 and Contract
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const web3Instance = new Web3(window.ethereum);
      const contract = new web3Instance.eth.Contract(DAPPazonABI.abi, DAPPazonAddress);
      setDappazonContract(contract);
    } else {
      console.error("Please install MetaMask to use this application.");
    }
  }, []);

  // Request account access and set account
  const loadBlockchain = async () => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  };

  // Fetch items from the blockchain
  const fetchItems = async () => {
    if (!dappazonContract) return;

    try {
      const itemCount = await dappazonContract.methods.id().call(); // Adjust as necessary
      const itemsArray: Item[] = [];
      for (let id = 1; id <= itemCount; id++) {
        const item = await dappazonContract.methods.items(id).call();
        itemsArray.push(item);
      }
      setItems(itemsArray);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  // Subscribe to Buy event
  // Buy item
  const buyItem = async (id: number) => {
    if (!dappazonContract || !account) return;

    try {
      const item = await dappazonContract.methods.items(id).call();
      const price = item.price;

      await dappazonContract.methods.buy(id).send({ from: account, value: price });
      console.log("Item purchased successfully.");
      setHasBought(true);
    } catch (error) {
      console.error("Error purchasing item:", error);
    }
  };

  // List new item
  const listItem = async () => {
    if (!dappazonContract || !account) return;

    const id = 1; // Example ID, you should take these values from user input
    const name = "Item Name";
    const category = "Category";
    const image = "image_url";
    const rating = 5;
    const price = Web3.utils.toWei("0.1", "ether"); // Example price
    const stock = 10;

    try {
      await dappazonContract.methods
        .list(id, name, category, image, rating, price, stock)
        .send({ from: account });
      console.log("Item listed successfully.");
      fetchItems(); // Re-fetch items after listing a new one
    } catch (error) {
      console.error("Error listing item:", error);
    }
  };

  // Handle opening the popup
  const openItemDetails = (item: Item) => {
    setSelectedItem(item);
  };
  useEffect(()=>{fetchItems()
    loadBlockchain()
  },[dappazonContract,buyItem])
  return (
    <div>
      <Navbar walletId={account ? account : ""} connectAccount={loadBlockchain} />
      <div className="p-4 m-3 pt-[100px]">
        <Button onClick={listItem}>List Item</Button>
        <Button onClick={() => buyItem(1)}>Buy Item</Button>
         {/* Example with item ID 1 */}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
          {items.map((item: Item) => (
            <Card key={item.id} className="w-full cursor-pointer" onClick={() => openItemDetails(item)}>
              <CardHeader>
                <p className="font-bold text-lg">{item.name}</p>
              </CardHeader>
              <CardContent>
                <img src={item.image} alt={item.name} className="w-full h-56 object-cover" />
                <p className="mt-2">Category: {item.category}</p>
                <p className="mt-2">Rating: {item.rating}</p>
                <p className="mt-2 text-xl font-semibold">
                  {Web3.utils.fromWei(item.price.toString(), "ether")} ETH
                </p>
                <p className="mt-2">Stock: {item.stock}</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => buyItem(item.id)} className="w-full">
                  Buy
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Display Buy Events */}
        <div>
          <h2>Purchase Events:</h2>
          <ul>
            {events.map((event, index) => (
              <li key={index}>
                Order ID: {event.returnValues.orderId}, Item ID: {event.returnValues.itemId}, Buyer: {event.returnValues.buyer}
              </li>
            ))}
          </ul>
        </div>

        {/* Popup Modal for Item Details */}
        {selectedItem && (
          <Dialog open={true} onOpenChange={() => setSelectedItem(null)}>
            <DialogContent>
              <DialogTitle>{selectedItem.name}</DialogTitle>
              <DialogDescription>
                <div className="mt-2">
                  <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-56 object-cover" />
                </div>
                <div className="mt-2">
                  <strong>Category: </strong>{selectedItem.category}
                </div>
                <div className="mt-2">
                  <strong>Rating: </strong>{selectedItem.rating}
                </div>
                <div className="mt-2 text-xl font-semibold">
                  <strong>Price: </strong>{Web3.utils.fromWei(selectedItem.price.toString(), "ether")} ETH
                </div>
                <div className="mt-2">
                  <strong>Stock: </strong>{selectedItem.stock}
                </div>
                <Button onClick={() => buyItem(selectedItem.id)} className="mt-4">
                  Buy
                </Button>
              </DialogDescription>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedItem(null)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Page;
