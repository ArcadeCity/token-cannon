# token-cannon
## Web app for mass distribution of ERC-20 tokens

### What the hell is this
A web app to help accomplish our goal of distributing our new ERC-20 Arcade Token ($ARCD) to a minimum of 10,000 people in our network by end of December as part of our [community giveaway](https://blog.arcade.city/the-arcade-token-arcd-sale-and-community-giveaway-begins-now-8eca8a503de1). And generally to make it easy to get our token into the hands of the most new people. 

### The idea

Decentralized marketplaces, to provide reliable service, need a critical mass of users.

These and other projects which rely on network effect will benefit from incentivizing an ever-increasing number of participants to join and grow their network. 

Projects with a native token thus have an interest in getting their token into the hands of the most people - assuming those people are willing or potential users of their ecosystem.

Indiscriminate 'airdrops' distributing tokens to, say, all holders of a certain amount of ETH (like the [Omise-Go airdrop](https://www.omise.co/omisego-airdrop-update-3)) have been one way to accomplish broad distribution - but with uncertain effectiveness in adding (non-monetary) value to a network.

The idea behind TokenCannon is to combine the mass distribution tactic of indiscriminate airdrops with a more focused 'aiming' of the distribution via standard techniques of lead generation.

A webpage where willing network participants opt in to receive free tokens, perhaps trading their email address or filling out a survey, could achieve broad distribution without wasting tokens on non-participants. This could be extended with gamification by programmatically offering additional tokens to users who refer others or complete other tasks that grow the network.


### Stack

* Meteor
* React
* web3

### Rough estimated timeline
* Dec 12 - Manual individual transactions (intended to partially automate our token pre-sale bonus distribution)
* Dec 18 - Semi-auto mode: Send 10+ transactions/minute to a list of addresses
* Dec 25 - Polished version ready for other Ethereum projects to easily use (Tokens make great Christmas presents!)

### Congestion issues?
* The (awesome) [CryptoKitties](https://www.cryptokitties.co/) app contributed substantially to Ethereum network congestion when it reached a few hundred thousand transactions in its first week, or about 10% of all transactions on the network.
* The projected usage of TokenCannon in the month of December for Arcade City alone is somewhere between 10K and 50K transactions, and at least 50K per month throughout 2018 as we distribute ARCD to new users.
* TokenCannon is currently designed for one-way distribution of tokens from project owners to users. But for those projects in which the token has transactional use, a significant increase of new users holding a token could lead to an exponential increase in transaction volume.
* If other projects use the TokenCannon similarly, the resulting transaction volume could grow to CryptoKitties-level congestion.
* A big thank you to everyone working to upgrade the Ethereum network to handle increased transaction volume!

### Contributing
* We welcome ideas and pull requests. For now we are organizing our open-source development in our Slack channel. Please email cityhall@arcade.city for an invite.
* Also open to ideas on how to better structure this project for rapid open-source development. Would Gitter be better than Slack? Should we set up Trello or StoriesOnBoard?

