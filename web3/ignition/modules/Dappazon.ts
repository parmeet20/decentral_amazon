import hre, { ethers } from 'hardhat'
import { items } from "../../src/items.json"

// The correct function to convert to wei (the smallest unit)
const tokens = (n: number) => {
    return ethers.parseUnits(n.toString(), 'wei'); // Use 'wei' here
}

async function main() {
    const [deployer] = await ethers.getSigners();
    const Dappazon = await hre.ethers.getContractFactory("Dappazon");
    const dappazon = await Dappazon.deploy();
    console.log(`Deployed to address -> ${await dappazon.getAddress()}`); // Make sure to await here
    
    for (let i = 0; i < items.length; i++) {
        const transaction = await dappazon.connect(deployer).list(
            items[i].id,
            items[i].name,
            items[i].category,
            items[i].image,
            items[i].rating,
            tokens(items[i].price), // Ensure price is converted to wei
            items[i].stock,
        );
        await transaction.wait();
        console.log(`Listed item ${items[i].id} -> ${items[i].name}`);
    }
}

main()
