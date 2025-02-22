---
title: Programming smart contracts on solana - in Rust
date: 2023-11-26 20:26:44
tags:
---

# How to write a simple smart contract for Solana in Rust?

## Introduction:

<p style="font-size: 20px">This rudimentary project is going to help us understand how to get started with writing a simple smart contract for Solana in Rust. By the end of this micro-guide, you should have a functioning backend for your Solana Project with the ability to run some tests that are important to make sure that our application does what we require it to.</p>

## Requirements:

### You will need a few things before you can start writing out the smart contract:

- Anchor: You will need the anchor framework to follow along as I have used anchor to manage the project. You can install anchor by following the instructions on their website: [Anchor Installation](https://www.anchor-lang.com/docs/installation)

- Solana: You can install solana by following the instructions on their website: [Solana Installation](https://docs.solana.com/cli/install-solana-cli-tools)

- NodeJS: You will need nodejs to run the tests. You can install nodejs by following the instructions on their website: [NodeJS Installation](https://nodejs.org/en/download/)

#### Most Importantly...

- Rust: You will need rust to write the smart contract. You can install rust by following the instructions on their website: [Rust Installation](https://www.rust-lang.org/tools/install)

### ⚠️ Once you have installed all the required tools, be sure to add them all to your path so you can execute them.

## Now that you have all the required tools, let's get started!

## Setup:

- Our first step would be to run solana-keygen to generate a keypair that we can use in case we want to deploy our smart contract. You can do this by running the following command:

```bash
solana-keygen new
```

For this project we will just be running tests to verify that our smart contact is working. So we will not be deploying it.

Now to confirm that solana has been installed correctly, run the following command:

```bash
solana-test-validator
```

This will start a local validator that we can use to run our tests.
If you see a counter on the screen, it means that the validator has been set up correctly.

- Next we will create a new anchor project by running the following command:

```bash
anchor init <project-name>
```

Once this completes, go ahead and run the following command:

```bash
anchor build
```

Now inside our anchor project folder we should see an Anchor.toml file.
This file contains our programID which we will use in our rust code.
Now we also need to have a wallet to monitor and approve the transactions that take place after we run tests on our smart contract. That is also specified in the Anchor.toml file.

## Writing the smart contract:

- First let us move into the programs directory and then into our project directory. Over here we can find the lib.rs file inside the src folder. This is the file where we will write our smart contract.

- Now let us start with the following:

```rust
#[account]
pub struct Item {
    pub content: String,
    pub user: Pubkey,
}
```

Since everything on Solana is an account, we need to give it a few specific attributes such as who is the owner of the account and what is stored in said account. This is what we are doing in the struct that we have defined.

- Now all we have left to do is the functions that allow us to create and delete an item. Let us try to make a small todo system where a user can just create and delete an item.

- Before we write the actual functions, we need to specify the context of the functions. This is done by using the following:

```rust
#[program]
pub mod sol_world {
    use super::*;

    pub fn init_item(ctx: Context<InitItem>, content: String) -> Result<()> {
        let item = &mut ctx.accounts.item;
        let user = &mut ctx.accounts.user;

        item.content = content;
        item.user = *user.key;

        Ok(())
    }

}
```

- This allows us to specify the accounts to be passed into the function.

- Lets start with the create function:

```rust
#[derive(Accounts)]
pub struct InitItem<'info> {
    #[account(
        init,
        payer = user,
        space = 2000
    )]
    pub item: Account<'info, Item>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}
```

- Here we are specifying who is paying the fee for performing this transaction, how much space we need to allocate for the account and the type of account we are creating.

Now in the same way we can also create a delete function:

```rust
#[derive(Accounts)]
pub struct FinishItem<'info> {
    #[account(
        mut,
        has_one = user,
        close = user
    )]
    pub item: Account<'info, Item>,

    #[account(mut)]
    pub user: Signer<'info>,
}

```

If you followed all the steps till now, you can write your own custom tests to verify the smart contract.

Here is an example tests function:

```ts
it("can create an item", async () => {
  await program.rpc.initItem("item content", {
    accounts: {
      item: item.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    },
    signers: [item],
  });

  let newItem = await program.account.item.fetch(item.publicKey);

  assert.strictEqual(newItem.content, "item content");
  assert.strictEqual(
    newItem.user.toBase58(),
    provider.wallet.publicKey.toBase58(),
  );
});
```

Once it verifies, it should look something like this:
![Output](/blog/smart-contracts-on-solana/anchortest.png)

## Future Scope:

- Now that we have the functions ready, we can call these functions from any frontend that we plan to use. This is a very simple smart contract but you can use this as a base to build more complex smart contracts.

# Conclusion:

With this I conclude my micro-guide on how to write a simple smart contract for Solana in Rust. I hope that after reading this, you were able to successfully build and test your own simple smart contract. Testing is a crucial part of writing smart contracts so I hope this was easy to understand.
