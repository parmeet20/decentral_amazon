// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
contract Dappazon {
    // struct of the item
    struct Item {
        uint256 id;
        string name;
        string category;
        string image;
        uint256 rating;
        uint256 price;
        uint256 stock;
    }
    // structure of Order
    struct Order {
        uint256 time;
        Item item;
    }
    event List(string name, uint256 cost, uint256 quantity);
    event Buy(address buyer, uint256 orderId, uint256 itemId);

    mapping(uint256 => Item) public items;
    mapping(address => uint256) public orderCount;
    mapping(address => mapping(uint256 => Order)) public orders;

    string public name;

    address public owner;
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor() {
        name = "Dappazon";
        owner = msg.sender;
    }
    // function to list items
    function list(
        uint256 _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint256 _rating,
        uint256 _price,
        uint256 _stock
    ) public onlyOwner {
        Item memory item = Item(
            _id,
            _name,
            _category,
            _image,
            _rating,
            _price,
            _stock
        );
        items[_id] = item;
        emit List(_name, _price, _stock);
    }
    function buy(uint256 _id) public payable {
        Item memory item = items[_id];
        require(msg.value>=item.price);
        require(item.stock>0);
        Order memory order = Order(block.timestamp, item);
        orderCount[msg.sender]++;
        orders[msg.sender][orderCount[msg.sender]] = order;
        items[_id].stock = item.stock - 1;
        emit Buy(msg.sender, orderCount[msg.sender], item.id);
    }
    function withdraw()public onlyOwner {
        (bool success,) = owner.call{value:address(this).balance}("");
        require(success);
    }
}
