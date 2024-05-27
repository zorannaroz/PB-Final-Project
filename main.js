////////////// FINAL VERSION /////////////////////

import readlineSync from "readline-sync";
import fs from "fs";

// Function to save cash register data to a file
const saveCashRegisterToFile = (cashRegister, filePath) => {
  try {
    const data = JSON.stringify(cashRegister, null, 2);
    fs.writeFileSync(filePath, data);
    console.log(`Cash register data saved to ${filePath}`);
  } catch (error) {
    console.error("Error saving cash register data:", error);
  }
};

// Function to retrieve cash register data from a file
const retrieveCashRegisterFromFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const cashRegister = JSON.parse(data);
    console.log(`Cash register data retrieved from ${filePath}`);
    return cashRegister;
  } catch (error) {
    console.error("Error retrieving cash register data:", error);
    return null;
  }
};

// Function to display the cash register data in a table
const printCashRegisterTable = (cashRegister) => {
  // Move the cursor to the top of the console
  process.stdout.write("\x1B[2J\x1B[H");

  console.log("Current cash register data:");
  console.table(
    cashRegister.map((bill, index) => ({
      index: index,
      name: bill.name,
      value: bill.value,
      available: bill.available,
    }))
  );
  const totalMoney = cashRegister.reduce(
    (total, bill) => total + bill.value * bill.available,
    0
  );
  console.log(`Total money in cash register: €${totalMoney.toFixed(2)}\n`);
};

// Function to initialize the cash register
const initializeCashRegister = () => {
  console.log("Please input the number of bills and coins in the register:\n");
  const cashRegister = [
    { name: "500 Euros", value: 500, available: 0 },
    { name: "200 Euros", value: 200, available: 0 },
    { name: "100 Euros", value: 100, available: 0 },
    { name: "50 Euros", value: 50, available: 0 },
    { name: "20 Euros", value: 20, available: 0 },
    { name: "10 Euros", value: 10, available: 0 },
    { name: "5 Euros (bill)", value: 5, available: 0 },
    { name: "5 Euros (coin)", value: 5, available: 0 },
    { name: "2 Euros", value: 2, available: 0 },
    { name: "1 Euro", value: 1, available: 0 },
    { name: "50 Cents", value: 0.5, available: 0 },
    { name: "20 Cents", value: 0.2, available: 0 },
    { name: "10 Cents", value: 0.1, available: 0 },
    { name: "5 Cents", value: 0.05, available: 0 },
    { name: "2 Cents", value: 0.02, available: 0 },
    { name: "1 Cent", value: 0.01, available: 0 },
  ];

  cashRegister.forEach((bill) => {
    bill.available = readlineSync.questionInt(
      `Enter the amount of ${bill.name} bills/coins: `
    );
  });

  printCashRegisterTable(cashRegister);

  return cashRegister;
};

// Function to add more money to the register or clean it
const manageCashRegister = (cashRegister) => {
  const option = readlineSync.question(
    "Enter 'add' to add money, 'clean' to empty the register, or 'exit' to return to the main menu: "
  );

  if (option.toLowerCase() === "clean") {
    cashRegister.forEach((bill) => {
      bill.available = 0;
    });
    console.log("Cash register has been emptied.");
  } else if (option.toLowerCase() === "add") {
    console.log("Please input the additional bills and coins to add:\n");
    cashRegister.forEach((bill) => {
      const additionalAmount = readlineSync.questionInt(
        `Enter the additional amount of ${bill.name} bills/coins: `
      );
      bill.available += additionalAmount;
    });
  } else if (option.toLowerCase() === "exit") {
    console.log("Returning to main menu...");
    return;
  } else {
    console.log("Invalid option. Please enter 'add', 'clean', or 'exit'.");
    return;
  }

  printCashRegisterTable(cashRegister);

  // Save cash register data to file
  saveCashRegisterToFile(cashRegister, "cash_register_data.json");
};

// Function to check if exact change can be given
const canProvideExactChange = (returnChange, cashRegister) => {
  let tempChange = returnChange;
  for (const bill of cashRegister.sort((a, b) => b.value - a.value)) {
    if (bill.value <= tempChange && bill.available > 0) {
      const count = Math.min(
        Math.floor(tempChange / bill.value),
        bill.available
      );
      tempChange -= count * bill.value;
      if (tempChange < 0.001) break;
    }
  }
  return tempChange < 0.001;
};

// Function to handle the paid amount
const handlePaidAmount = (paidAmount, cashRegister) => {
  let remainingAmount = paidAmount; // Use remainingAmount to track what's left to add
  cashRegister.forEach((bill) => {
    if (bill.value <= remainingAmount) {
      const count = Math.floor(remainingAmount / bill.value);
      remainingAmount -= count * bill.value;
      bill.available += count;
      console.log(`Added ${count} ${bill.name} to cash register.`);
    }
  });

  // Handle any remaining amount due to floating-point precision
  if (remainingAmount > 0) {
    remainingAmount = parseFloat(remainingAmount.toFixed(2));
    for (let bill of cashRegister) {
      if (bill.value === remainingAmount) {
        bill.available += 1;
        console.log(`Added 1 ${bill.name} to cash register.`);
        break;
      }
    }
  }
};

// Function to handle the return change
const handleReturnChange = (returnChange, cashRegister) => {
  cashRegister.sort((a, b) => b.value - a.value); // Sort denominations in descending order

  cashRegister.forEach((bill) => {
    if (bill.value <= returnChange && bill.available > 0) {
      let count = Math.floor(returnChange / bill.value);
      count = Math.min(count, bill.available);
      returnChange -= count * bill.value;
      bill.available -= count;
      console.log(`Returned ${count} ${bill.name}`);
    }
  });

  if (returnChange > 0.001) {
    console.log(`Cannot provide exact change of €${returnChange.toFixed(2)}.`);
  }
};

// Function to perform a single transaction
const performTransaction = (price, paidAmount, cashRegister) => {
  let returnChange = parseFloat((paidAmount - price).toFixed(2)); // Ensure precision for returnChange

  if (returnChange < 0) {
    console.log(
      `Customer should pay €${Math.abs(returnChange).toFixed(2)} more.`
    );
    return;
  }

  console.log(`Change to be returned: €${returnChange.toFixed(2)}.`);

  // Handle the paid amount first
  handlePaidAmount(paidAmount, cashRegister);

  // Check if the register can provide the exact change
  if (!canProvideExactChange(returnChange, cashRegister)) {
    console.log("Unable to provide exact change. Transaction cancelled.");
    return;
  }

  // Handle the return change
  handleReturnChange(returnChange, cashRegister);

  // Print the cash register table after changes
  printCashRegisterTable(cashRegister);

  // Save cash register data to file
  saveCashRegisterToFile(cashRegister, "cash_register_data.json");
};

// Function to perform multiple transactions until the user chooses to exit
const performTransactions = (cashRegister) => {
  while (true) {
    const priceInput = readlineSync.question(
      "Enter the price (€) or type 'exit' to quit: "
    );
    console.log();
    // Exit if user types 'exit'
    if (priceInput.toLowerCase() === "exit") {
      console.log("Exiting transactions...");
      break;
    }

    const price = parseFloat(priceInput.replace(",", "."));

    // Continue with transaction if price is valid
    if (!isNaN(price)) {
      console.log();
      const paidAmount = parseFloat(
        readlineSync.question("Enter the paid amount (€): ").replace(",", ".")
      );
      console.log();

      performTransaction(price, paidAmount, cashRegister);
    } else {
      console.log(
        "Invalid input. Please enter a valid price or type 'exit' to quit."
      );
    }
  }
};

// Retrieve cash register data from file
const retrievedCashRegister = retrieveCashRegisterFromFile(
  "cash_register_data.json"
);

// Initialize or update cash register
let cashRegister;
if (retrievedCashRegister) {
  cashRegister = retrievedCashRegister;
  printCashRegisterTable(cashRegister);
} else {
  cashRegister = initializeCashRegister();
}

console.log("Cash register initialized successfully.");
console.log();

// Main program logic
while (true) {
  const option = readlineSync.question(
    "Enter 'transaction' to perform a transaction, 'manage' to add money or clean the register, or 'exit' to quit: "
  );
  console.log();
  if (option.toLowerCase() === "exit") {
    console.log("Exiting...");
    break;
  }

  if (option.toLowerCase() === "manage") {
    manageCashRegister(cashRegister);
  } else if (option.toLowerCase() === "transaction") {
    performTransactions(cashRegister);
  } else {
    console.log(
      "Invalid option. Please enter 'transaction', 'manage', or 'exit'."
    );
  }
}
