# PB-Final-Project
Programming basics final project
THE CASHIER ...

This program is a comprehensive solution for managing a cash register, including handling transactions, managing cash in the register, and saving/retrieving data from a file. Below is a breakdown of the program's functionality and key components:

1. Importing Necessary Modules:

 - readline-sync for synchronous user input.
- fs for file system operations to read and write cash register data.

2. Functions for Saving and Retrieving Data:

- saveCashRegisterToFile: Saves the cash register data to a specified JSON file.
- retrieveCashRegisterFromFile: Retrieves the cash register data from a specified JSON file.

3. Cash Register Initialization:

- initializeCashRegister: Prompts the user to input the number of each type of bill and coin in the register and initializes the cash register.

4. Managing the Cash Register:

- manageCashRegister: Allows the user to add money to the register or empty it.

5. Transaction Handling:

- performTransaction: Handles a single transaction, including calculating and providing change.
- performTransactions: Manages multiple transactions until the user decides to exit.

6. Change Calculation:

- canProvideExactChange: Checks if the cash register can provide exact change for a given amount.
- handlePaidAmount: Adds the paid amount to the cash register.
- handleReturnChange: Calculates and provides the necessary change to the customer.

7. User Interface:

- Displays a menu for the user to perform transactions, manage the cash register, or exit the program.

