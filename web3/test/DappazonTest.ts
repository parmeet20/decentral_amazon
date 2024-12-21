import { expect } from "chai";
import { ethers } from "hardhat";
import { Dappazon } from "../typechain-types";
import { Signer } from "ethers";
const tokens = (n: number) => {
    return ethers.parseUnits(n.toString(), 'ether');
}
describe("Dappazon", () => {
    let dappazon: Dappazon;
    let deployer: Signer, buyer: Signer;
    const ID = 1;
    const NAME = "Shoes";
    const CATEGORY = "clothing";
    const IMAGE = "image.jpeg";
    const RATING = 3;
    const PRICE = tokens(1);
    const STOCK = 4;
    beforeEach(async () => {
        const Dappazon = await ethers.getContractFactory("Dappazon");
        dappazon = await Dappazon.deploy();
        [deployer, buyer] = await ethers.getSigners();
        console.log(await dappazon.owner())
    })
    describe("Deployment", () => {
        it('sets the owner', async () => {
            expect(await dappazon.owner()).to.equal(await deployer.getAddress());
        })
        it('has a name', async () => {
            const Dappazon = await ethers.getContractFactory("Dappazon");
            const dappazon = await Dappazon.deploy();
            const name = await dappazon.name();
            expect(name).to.equal("Dappazon");
        })
    })
    describe('Listing', () => {
        let transaction;
        beforeEach(async () => {
            transaction = await dappazon.connect(deployer).list(ID, "Shoes", "clothing", "image.jpeg", 3, 1000000000000000000n, 4)
            await transaction.wait();
            transaction = await dappazon.connect(buyer).buy(ID,{value:PRICE});
        })
        it('Returns item attributes', async () => {
            const item = await dappazon.items(1);
            expect(item.id).to.equal(ID);
            expect(item.name).to.equal(NAME);
            expect(item.image).to.equal(IMAGE);
            expect(item.category).to.equal(CATEGORY);
            expect(item.rating).to.equal(RATING);
            expect(item.price).to.equal(PRICE);
            expect(item.stock).to.equal(STOCK-1);
        })
        it('updates contract banance',async()=>{
            const result = await ethers.provider.getBalance(dappazon.getAddress());
            console.log(result);
            expect(result).to.equal(PRICE);
        })
        it('updates order count',async()=>{
            const result = await dappazon.orderCount(buyer.getAddress());
            expect(result).to.equal(1);
        })
        it('adds the order',async()=>{
            const order = await dappazon.orders(buyer.getAddress(),1);
            expect(order.time).to.be.greaterThan(0);
            expect(order.item.name).to.equal(NAME);
        })
    })
})