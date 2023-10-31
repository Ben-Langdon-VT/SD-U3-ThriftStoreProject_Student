//? This array is not to be changed.
const salesTax = [
    {state: 'Alabama', tax: .04},
    {state: 'Alaska', tax: .00},
    {state: 'Arizona', tax: .056},
    {state: 'Arkansas', tax: .065},
    {state: 'California', tax: .0725},
    {state: 'Colorado', tax: .029},
    {state: 'Connecticut', tax: .0635},
    {state: 'Delaware', tax: .00},
    {state: 'DC', tax: .06},
    {state: 'Florida', tax: .06},
    {state: 'Georgia', tax: .04},
    {state: 'Hawaii', tax: .04166},
    {state: 'Idaho', tax: .06},
    {state: 'Illinois', tax: .0625},
    {state: 'Indiana', tax: .07},
    {state: 'Iowa', tax: .06},
    {state: 'Kansas', tax: .065},
    {state: 'Kentucky', tax: .06},
    {state: 'Louisiana', tax: .0445},
    {state: 'Maine', tax: .055},
    {state: 'Maryland', tax: .06},
    {state: 'Massachusetts', tax: .0625},
    {state: 'Michigan', tax: .06},
    {state: 'Minnesota', tax: .06875},
    {state: 'Mississippi', tax: .07},
    {state: 'Missouri', tax: .04225},
    {state: 'Montana', tax: .00},
    {state: 'Nebraska', tax: .055},
    {state: 'Nevada', tax: .0685},
    {state: 'New Hampshire', tax: .00},
    {state: 'New Jersey', tax: .06625},
    {state: 'New Mexico', tax: .05125},
    {state: 'New York', tax: .04},
    {state: 'North Carolina', tax: .0475},
    {state: 'North Dakota', tax: .05},
    {state: 'Ohio', tax: .0575},
    {state: 'Oklahoma', tax: .045},
    {state: 'Oregon', tax: .00},
    {state: 'Pennsylvania', tax: .06},
    {state: 'Rhode Island', tax: .07},
    {state: 'South Carolina', tax: .06},
    {state: 'South Dakota', tax: .06},
    {state: 'Tennessee', tax: .07},
    {state: 'Texas', tax: .0625},
    {state: 'Utah', tax: .061},
    {state: 'Vermont', tax: .06},
    {state: 'Virginia', tax: .053},
    {state: 'Washington', tax: .065},
    {state: 'West Virginia', tax: .06},
    {state: 'Wisconsin', tax: .05},
    {state: 'Wyoming', tax: .04},
];

//! Classes
class Location {
    constructor(city, state) {
        this.city = city;
        this.state = state;
    }
}

class Store {

    static NewStore(store_name, city_name, state_name, balance){
        //Check store, city, state names are strings
        if(!store_name instanceof String){
            console.error("Store.newStore() store_name is not a string:", store_name);
            return undefined;
        }
        if(!city_name instanceof String){
            console.error("Store.newStore() city_name is not a string:", city_name);
            return undefined;
        }
        if(!state_name instanceof String){
            console.error("Store.newStore() state_name is not a string:", state_name);
            return undefined;
        }
        //check if balance valid, for now just a positive number check, maybe do cash later
        if(!balance instanceof Number || balance < 0){
            console.error("Store.newStore() balance needs to be a positive number:", balance);
            return undefined;
        }
        //check if state name exists in salesTax array
        let state_data = salesTax.find(entry => entry.state === state_name);
        if(state_data === undefined){
            console.error("Invalid state name", state_name, "not found in salesTax array.");
            return undefined;
        }
        //All good, make the object
        let location = new Location(city_name, state_name);
        return new Store(store_name, location, state_data.tax, balance);
    }

    constructor(name, location, sales_tax, balance) {
        this.name = name;
        this.location = location;
        this.sales_tax = sales_tax;

        this.inventory = {};//store this as a dict i guess, makes sense if sorted by id for more efficiently looking up items
        this.balance = balance;
        this.expenses = 0;
        this.profit = 0;
        this.paid_tax = 0;
    }

    addToInventory(newItem, markup) {
        if(!(newItem instanceof Item)||(typeof markup !== 'number')){
            console.error('Store.addToInventory() Parameter errors:',
                    `\nnewItem:`, newItem,
                    `\nmarkup:`, markup);
            return false;
        }
        let price = newItem.getFullPurchasePrice();
        if (price > this.balance){
            console.log(`Store ${this.name} does not have the funds(${this.balance}) to purchase:`,
                    `\nItem ${newItem.name}: ${price} (unit price: ${newItem.purchase_price}, quantity: ${newItem.quantity})`);
            return false;
        }
        this.balance -= price;
        this.expenses += price;
        if (this.inventory[newItem.getUPC()] !== undefined){
            this.inventory[newItem.getUPC()].addQuantity(newItem.getQuantity());
            // console.log("Adding known item to inventory:", newItem.getUPC());
            // console.log("newItem name:", newItem.name);
            // console.log("newItem quantity", newItem.quantity);
            // console.log("new total quantity", this.inventory[newItem.getUPC()].getQuantity());
        }
        else {
            newItem.setMarketPrice(markup);
            this.inventory[newItem.upc] = newItem;
        }
    }

    sellItemById(itemId, quantity) {
        //Is itemId valid
        if(!Number.isInteger(itemId) || !checkUPC(itemId)){
            console.error("Store.sellItemById(): Not valid UPC code:", itemId);
            return false;
        }
        //Is Quantity valid
        if(!Number.isInteger(quantity) || quantity < 0){
            console.error("Store.sellItemById(): invalid parameter quantity", quantity);
            return false;
        }

        let targetItem = this.inventory[itemId];
        //Is there an item with quantity greater than 1 at this upc
        if((! targetItem instanceof Item)||(targetItem.getQuantity() === 0)){
            console.log("Item: ", itemId, "is not in stock.");
            return false;
        }

        let [purchase_price, market_price] = targetItem.buyQuantity(quantity);

        //fail case error with calculating values, return false, no need for console logs cause we already probably printed this type of error
        if((purchase_price===false) || (market_price === false)){
            return false;
        }
        let tax = (market_price * this.sales_tax).toFixed(2);
        this.balance += market_price - tax;
        this.profit += market_price - purchase_price - tax;
        this.paid_tax += tax;-
        console.log("Bought",targetItem.name,", Quantity:", quantity);
        return true;
    }
}

class Item{
    //Write factory
    static newItem(upc, name, type, purchase_price, quantity){
        if(!Number.isInteger(upc) || !checkUPC(upc)){
            //Maybe add checking to this to determine if a valid upc, not really following the math explanation for the check digit
            console.error("Item.newItem() upc should be a 12 digit integer: ", upc);
            console.error("Length:",upc.toString().length);
            console.error("!heckUPC():", !checkUPC());
            return undefined;
        }

        //Check string inputs
        if(!name instanceof String){
            console.error("Item.newItem() name is not a string:", name);
            return undefined;
        }

        if(!type instanceof String){
            console.error("Item.newItem() type is not a string", type);
            return undefined;
        }

        //check purchase price is positive number, and quantity is a positive int
        //could extend purchase_price to make sure it is valid price eg decimal with 2 digits
        if(!purchase_price instanceof Number || purchase_price < 0){
            console.error("Item.newItem() purchase price must be a number > 0", purchase_price);
            return undefined;
        }

        if(!Number.isInteger(quantity) || quantity < 0){
            console.error("Item.newItem() quantity must be integer greater than 0", quantity);
            return undefined;
        }
        return new Item(upc,name,type,purchase_price, quantity);
    }

    constructor(upc, name, type, purchase_price, quantity = 1) {
        this.upc= upc;
        this.name = name;
        this.type = type;
        this.purchase_price = purchase_price.toFixed(2);
        this.quantity = quantity;
        this.market_price;
    }
    getFullPurchasePrice() {
        return this.getPurchasePrice(this.quantity);
    }

    setMarketPrice(markup) {
        this.market_price = (this.purchase_price * (1 + markup)).toFixed(2);
    }

    hasQuantity(quantity) {
        if((typeof quantity !== 'number')||(quantity <= 0)){
            console.log(`Item.hasQuantity() parameter error: ${quantity}`);
            return false;
        }
        if(quantity <= this.quantity){
            return true;
        }
        else{
            return false;
        }
    }
    getPurchasePrice(quantity) {
        if(typeof quantity !== 'number'){
            console.log(`Item.getPurchasePrice() parameter error: ${quantity}`);
            return false;
        }
        return quantity * this.purchase_price;
    }

    getSalePrice(quantity) {
        return quantity * this.market_price;
    }

    buyQuantity(quantity) {
        if (!this.hasQuantity(quantity)){
            console.log("Not enough items in stock, cannot purchase.");
            return [false,false];
        }
        if(this.market_price === undefined){
            console.log(`Item.BuyQuantity() call error, must be called after item is added to store.`);
            return [false,false];
        }
        this.quantity -= quantity;
        let purchase_price = this.getPurchasePrice(quantity);
        let market_price = this.getSalePrice(quantity);
        return [purchase_price, market_price];
    }

    getUPC(){
        return this.upc;
    }

    getQuantity(){
        return this.quantity;
    }

    addQuantity(quantity){
        this.quantity += quantity;
    }
}

let usedUPC = [];

function randomPositiveInteger(digits = 1){
    //default range between 0 and 1
    return Math.floor(Math.random() * 10**(digits));
}

function sumEveryOtherDigit(numberStr, offset = 0){
    let i = offset;
    let sum = 0;
    while(i < numberStr.length){
        sum += Number.parseInt(numberStr[i]);
        i += 2;
    }
    return sum; 
}

function addCheckDigitUPC(num){
    let sumOdd = sumEveryOtherDigit(num.toString(), 0);
    let sumEven = sumEveryOtherDigit(num.toString(), 1);
    let fullSum = sumOdd * 3 + sumEven;
    let checkDigit = Math.ceil(fullSum/10) * 10 - fullSum;
    return num * 10 + checkDigit;
}

function newUPC(){
    let newNum = randomPositiveInteger(11);
    do{
        newNum = addCheckDigitUPC(newNum);
    }
    while(usedUPC.includes(newNum)|| newNum.toString().length !== 12);
    // console.log("New UPC:", newNum);
    usedUPC.push(newNum);
    return newNum;
}

function checkUPC(num){
    let rawNum = Math.floor(num/10);
    if(addCheckDigitUPC(rawNum)===num){
        return true;
    }
    else{
        return false;
    }
}

//! CREATE STORES
// Generate 3 different stores, each in a different state.

let Store1 = Store.NewStore("Marty's Spoon Shop", "MartyTown", "Iowa", 126);
let Store2 = Store.NewStore("Marky Mark's Funky Emporium", "Boston", "Massachusetts", 195);
let Store3 = Store.NewStore("Generic Shop, Nothing Suspicious", "Albuquerque", "New Mexico", 101);

//! Inventory
let item1 = Item.newItem(newUPC(), "Fancy Spoon", "Kitchenware", 19.00, 1);
let item2 = Item.newItem(newUPC(), "Old Guitar", "Music", 50.75, 1);
let item3 = Item.newItem(newUPC(), "Intro To Javascript", "Book", 25.00, 1);
let item4 = Item.newItem(newUPC(), "Slightly used Espresso Machine", "Kitchenware", 47.00, 1);
let item5 = Item.newItem(newUPC(), "Novelty Paperweight", "Other", 5.00, 1);

let item7 = Item.newItem(newUPC(), "Gigantic Bean Bag Chair", "Houseware", 30.00, 1);
let item8 = Item.newItem(newUPC(), "Javascript For Dummies", "Book", 24.73, 1);

//Quantity over 1-
let item9 = Item.newItem(newUPC(), "Low Quality Spoon", "Kitchenware", 5.00, 5);
let item10 = Item.newItem(newUPC(), "Shiny Rocks", "Other", 0,50, 20);

//Duplicates
let item6 = Item.newItem(newUPC(), "Average Spoon", "Kitchenware", 10.00, 1);
let item11 = Item.newItem(item6.getUPC(), "Average Spoon", "Kitchenware", 10.00, 1);
let item12 = Item.newItem(item6.getUPC(), "Average Spoon", "Kitchenware", 10.00, 1);

//! Stocking

//* First Store
let markup = .15
Store1.addToInventory(item1, markup);
Store1.addToInventory(item6, markup);
Store1.addToInventory(item11, markup);
Store1.addToInventory(item12, markup);
Store1.addToInventory(item9, markup);

//* Second Store
markup = .2;
Store2.addToInventory(item2, markup);
Store2.addToInventory(item5, markup);
Store2.addToInventory(item4, markup);
Store2.addToInventory(item10, markup);


//* Third Store
markup = .4;
Store3.addToInventory(item8, markup);
Store3.addToInventory(item7, markup);
Store3.addToInventory(item3, markup);

//! Selling

//* First Store
Store1.sellItemById(item1.getUPC(), 1);
Store1.sellItemById(item6.getUPC(), 2);
Store1.sellItemById(item6.getUPC(), 2);

//* Second Store

//* Third Store

//! Testing
/* 
    Simply console log each store to check the completed details.
*/

console.log(Store1);
console.log(Store2);
console.log(Store3);