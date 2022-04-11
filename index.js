const inquirer = require("inquirer");
const chalk = require("chalk");

const fs = require("fs");

operation();

function operation() {
  inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What do you want to do?",
      choices: [
        "Create a new account",
        "View account balance",
        "Deposit to an account",
        "Withdraw from an account",
        "Exit",
      ],
    },
  ]).then((answer) => {
    const action = answer.action;

    switch (action) {
      case "Create a new account":
        greetings();
        break;
      case "View account balance":
        getAccountBalance();
        break;
      case "Deposit to an account":
        addValueToAccount();
        break;
      case "Withdraw from an account":
        withdrawFromAccount();
        break;
      case "Exit":
        console.log(chalk.bgGreen.black("Thank you for using our services!"));
        process.exit();
      default:
        return;
    }
  }).catch((err) => {
    console.log(err.message);
  });
}

//Create account

function greetings() {
  console.log(chalk.bgGreen.black("\nThank you for creating an account with us!"));
  console.log(chalk.green("Please, enter the data required to create an account.\n"));

  createAccount();
}

function createAccount() {
  inquirer.prompt([{
    name: 'accountName',
    message: 'Please, type the name for your account:',
  }]).then(answer => {
    const accountName = answer.accountName;

    if (!fs.existsSync('accounts')) {
      fs.mkdirSync('accounts');
    }
    if (fs.existsSync(`accounts/${accountName}.json`)) {
      console.log(chalk.bgRed.black(`\nAccount ${accountName} already exists!\n`));
      operation();
      return;
    }
    fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', (err) => {
      console.log(err.message);
    });

    console.log(chalk.bgGreen.black(`\nAccount ${accountName} successfully created!\n`));
    operation();


  }).catch(err => {
    console.log(err.message);
  })
}

function addValueToAccount() {
  inquirer.prompt([{
    name: 'accountName',
    message: 'Please, enter the name of the account you would like to deposit money to:',
  }]).then(answer => {
    const accountName = answer.accountName;

    if (!isAccount(accountName)) {
      return operation();
    }

    inquirer.prompt([{
      name: 'amount',
      message: 'Please, enter the amount you would like to deposit:',
    }]).then(res => {
      const amount = res.amount;

      addAmount(accountName, amount);
      operation();
    }).catch(err => {
      console.log(err.message);
    })

  }).catch(err => {
    console.log(err.message);
  })
}

function isAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(chalk.bgRed.black(`\nAccount ${accountName} does not exist!\n`));
    return false;
  }

  return true;
}

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(chalk.bgRed.black(`\nPlease, enter a valid amount!\n`));
    return operation();
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

  fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), (err) => {
    console.log(err.message);
  })

  console.log(chalk.bgGreen.black(`\n${amount}$ successfully deposited to account named ${accountName}!\n`));

}

function withdraw(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(chalk.bgRed.black(`\nPlease, enter a valid amount!\n`));
  }

  if (parseFloat(amount) > parseFloat(accountData.balance)) {
    console.log(chalk.bgRed.black(`\nYou do not have enough money in your account!\n`));
    return operation();
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

  fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), (err) => {
    console.log(err.message);
  })
  console.log(chalk.bgGreen.black(`\n${amount}$ successfully withdrawn from account named ${accountName}!\n`));
}

function getAccountBalance() {
  inquirer.prompt([{
    name: 'accountName',
    message: 'Please, enter the name of the account you would like to view the balance of:',
  }]).then(answer => {
    const accountName = answer.accountName;

    if (!isAccount(accountName)) {
      return getAccountBalance();
    }

    const accountData = getAccount(accountName);

    console.log(chalk.bgBlue.black(`\nThe balance of account ${accountName} is ${accountData.balance}$\n`));
    operation();
  }).catch(err => {
    console.log(err.message);
  })
}

function withdrawFromAccount() {
  inquirer.prompt([{
    name: 'accountName',
    message: 'Please, enter the name of the account you would like to withdraw money from:',
  }]).then(answer => {
    const accountName = answer.accountName;

    if (!isAccount(accountName)) {
      return withdrawFromAccount();
    }

    inquirer.prompt([{
      name: 'amount',
      message: 'Please, enter the amount you would like to withdraw:',
    }]).then(res => {
      const amount = res.amount;

      withdraw(accountName, amount);      

    }).catch(err => { console.log(err.message); })
  }).catch(err => {
    console.log(err.message);
  })
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: 'utf8',
    flag: 'r',
  });

  return JSON.parse(accountJSON);
}