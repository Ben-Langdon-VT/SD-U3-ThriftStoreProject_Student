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
        state_data = salesTax.find(entry => entry.state === state_name);
        if(state_data === undefined){
            console.error("Invalid state name", state_name, "not found in salesTax array.");
            return undefined;
        }
        location = new Location(city_name, state_name);
        return Store(store_name, location, state_data.tax, balance);
    }

    constructor(name, location, sales_tax, balance) {
        this.name = name;
        this.location = location;
        this.sales_tax = sales_tax;

        this.inventory = {};//store this as a dict i guess, makes sense if sorted by id
        this.balance = balance;
        this.expenses = 0;
        this.profit = 0;
        this.paid_tax = 0;
    }

    addToInventory(newItem, markup) {
        if(!(newItem instanceof Item)||(typeof markup !== 'number')){
            console.error('Store.addToInventory() Parameter errors:',
                    `\nnewItem: ${newItem}`,
                    `\nmarkup: ${markup}`);
            return false;
        }
        let price = newItem.getFullPurchasePrice();
        if (price > this.balance){
            console.log(`Store ${this.name} does not have the funds(${this.balance}) to purchase:`,
                    `\nItem ${newItem.name}: ${price} (unit price: ${newItem.purchase_price}, quantity: ${newItem.quantity})`);
            return false;
        }
        balance -= price;
        this.expenses += price;
        if (inventory[upc] !== undefined){
            inventory[upc].quantity += newItem.quantity;
        }
        else {
            newItem.setMarketPrice(markup);
            inventory[newItem.upc] = newItem;
        }
    }

    sellItemById(itemId, quantity) {
        targetItem = this.inventory[itemId];
        if(! targetItem instanceof Item){
            console.error("Store.sellItem() error: unable to find itemId", itemId);
            return false;
        }
        if(!targetItem instanceof Item){
            console.error("Store.sellItem() error: item at item id not class Item\n", targetItem);
            return false
        }

        let [purchase_price, market_price] = targetItem.buyQuantity(quantity);

        //fail case error with calculating values, return false, no need for console logs cause we already probably printed this type of error
        if((purchase_price===false) || (market_price === false)){
            return false;
        }
        tax = market_price * this.sales_tax;
        this.balance += market_price - tax;
        this.profit += market_price - purchase_price - tax;
        this.paid_tax += tax;
        return true;
    }
}

class Item{
    constructor(upc, name, type, purchase_price, quantity = 1) {
        this.upc= upc;
        this.name = name;
        this.type = type;
        this.purchase_price = purchase_price;
        this.quantity = quantity;
        this.market_price;
    }
    getFullPurchasePrice() {
        return this.getPurchasePrice(this.quantity);
    }

    setMarketPrice(markup) {
        this.market_price = this.purchase_price * (1 + markup);
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
}

//! CREATE STORES
// Generate 3 different stores, each in a different state.

//! Inventory


//! Stocking

//* First Store

//* Second Store

//* Third Store

//! Selling

//* First Store

//* Second Store

//* Third Store

//! Testing
/* 
    Simply console log each store to check the completed details.
*/