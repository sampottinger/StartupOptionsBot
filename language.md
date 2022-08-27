DSL Definition
===============================================================================
Though StartUpOptionsBot.com provides a UI to build simulations, one can also use a small programming language (called a [domain specific language](https://tomassetti.me/domain-specific-languages/#what_are_dsls)). In some cases, it may provide a better user experience or allow the definition of more complex or narrowly tailored simluations.

<br>

Disclaimer
-------------------------------------------------------------------------------
Note that this page is subject to the [StartUpOptionsBot disclaimers](https://startupoptionsbot.com/disclaimer.html) and [MIT license](https://startupoptionsbot.com/license.txt). By continuing, you agree to both.

<br>

Running simulations
-------------------------------------------------------------------------------
One can run simulations by going to [StartUpOptionsBot.com](https://startupoptionsbot.com) and clicking the code editor tab. There, you can copy and paste your code into the text area. Note that switching to using code may prevent the use of the UI to edit simulations if using language features not supported in the UI-Based editor.

<br>

Structure of a program
-------------------------------------------------------------------------------
The general structure of a program is as follows:

```
[ variables ]
{
    branches
}
```

The variables section refers to simple numeric configuration options that indicate how the simulation should operate. The variables available for modification are the same for all simulations.

In contrast, the branches section will change between each simulation and the code here changes the structure of the simulation itself. The branches contain probabilities that the employee or company will take certain actions.

<br>

Variables
-------------------------------------------------------------------------------
The variables available for modification stay the same from simulation to simulation. These variables are defined below:

 - `immediatelyVest` is the number of shares that will immediate vest at [the cliff](https://carta.com/blog/equity-101-stock-option-basics/#vesting).
 - `ipoBuy` is the percent of remaining shares to buy if there is an initial public offering. Note that this assumes no [acceleration](https://www.cooleygo.com/what-are-single-and-double-trigger-acceleration-and-how-do-they-work/) and will not simulate buying options which vest after IPO.
 - `longTermTax` is the effective tax rate on stock sale which qualify as [long term capital gains](https://www.bankrate.com/investing/long-term-capital-gains-tax/). This assumes that stocks sold after one year from exercise are long term capital gains.
 - `monthlyVest` is the number of options that vest monthly. Note that this only supports monthly vesting. [Learn more about vesting schedules](https://carta.com/blog/equity-101-stock-option-basics/#vesting)
 - `optionTax` is the effective [tax rate paid on the spread](https://every.to/p/what-should-you-do-with-your-options-during-a-downturn).
 - `quitBuy` is the percent of options to purchase if the simulation has the employee leaving the company. Note that this assumes no [acceleration](https://www.cooleygo.com/what-are-single-and-double-trigger-acceleration-and-how-do-they-work/) and that this is the percent of un-exercised options vested at time of leaving the company.
 - `rangeStd` refers to how to interpret ranges in actions. See distributions.
 - `regularIncomeTax` is the effective tax rate for stock sales if those stocks are considered [short term gains](https://www.bankrate.com/investing/long-term-capital-gains-tax/). This assumes that stocks sold after one year from exercise are long term capital gains.
 - `sellBuy` is what percent of options to exercise if the company is purchased. Note that this assumes no [acceleration](https://www.cooleygo.com/what-are-single-and-double-trigger-acceleration-and-how-do-they-work/) and will not simulate buying options which vest after the sale.
 - `startFMV` is the fair market value of the options at the start of the simulation. Simulations take into account chnges in FMV at each fund raise round but do not consider changes in FMV caused by other events. [Learn more about FMV and spread](https://every.to/p/what-should-you-do-with-your-options-during-a-downturn).
 - `startMonthHigh` is the high end of the range for how long there will be a delay from date of running simulation to state 0.
 - `startMonthLow` is the low end of the range for how long there will be a delay from date of running simulation to state 0.
 - `startTotalShares` is the [fully diluted number of shares at the company](https://www.investopedia.com/terms/f/fullydilutedshares.asp).
 - `startVestingMonths` is the number of months from date of running simulation to [the cliff](https://carta.com/blog/equity-101-stock-option-basics/#vesting).
 - `strikePrice` is the price at which the employee can exercise options.
 - `totalGrant` is the total number of options granted to the employee. Note that simulations will not consider [different classes of stocks](https://www.upcounsel.com/classes-of-stock).
 - `useLogNorm` indicates which distribution shape should be used for share or company value during sale or IPO. Use 1 for log normal and 0 for normal. See distributions. In the case of floating point values, will test if greater than 0.5 such that all values above 0.5 are interpreted as 1.
 - `waitToSell` indicates if the employee will wait until all stocks are [long term capital gains](https://www.bankrate.com/investing/long-term-capital-gains-tax/) before sale. Use 1 for wait for long term capital gains or 0 if sotcks are sold immediately at exit. In the case of floating point values, will test if greater than 0.5 such that all values above 0.5 are interpreted as 1. This assumes that stocks sold after one year from exercise are long term capital gains.

Commas are allowed (and ignored) for variable values as desired for readability. Percentages should be expressed as numbers from 0 to 100 for 0 to 100% respectively (not 0 to 1).

<br>

Distributions
-------------------------------------------------------------------------------
When working with ranges of values, in general simulations build [normal distributions](https://mathworld.wolfram.com/NormalDistribution.html) from which random values are selected. These distributions are built such that:

 - **mean** is the average of the range high and low value.
 - **std** is the (range high - mean) / `rangeStd`.

Simulations may also use the [log normal](https://mathworld.wolfram.com/LogNormalDistribution.html) distribution for randomly selecting share or company value during sale or IPO. The log normal uses mean = 0 and std = 0.5. One is subtracted from the result and this value is then multiplied by the standard deviation (using std above) and mean (using mean above) added. Use of log normal is controlled by the `useLogNorm` variable.

<br>

Branches
-------------------------------------------------------------------------------
Branches contain multiple actions in the following form:

```
{
    actor_probability: action
    | actor_probability: action
}
```

Each action has an actor and a probability associated with it:

 - **actor**: Actor must be `c` for company or `e` for employee. 
 - **probability**: This is a value from 0 to 1 or `else` which represents the probability an action will happen for an actor. See probabilities.
 - **action**: This is the action to be taken if the branch is selected for the actor. See actions.

In each simulation, up to one event is chosen per actor per branch randomly using the probabilities provided.

<br>

Probabilities
-------------------------------------------------------------------------------
Probabilities are represented as "finite" probabilities or "else".

 - **Finite**: Finite probabilities should be expressed as 0 to 1 with 0 being (essentially) zero probability and 1 being 100% probability. Probabilities below 0.0001 are treated as zero.
 - **else**: If all probabilities for an actor on a state add up to less than 1, an else probability is chosen if available. If there are multiple else branches, one is chosen at random with equal probability of selection.

If probabilities add up to more than 1, an error is generated (with some tollerance for floating point imprecision). If probabilities add up to less than 1, an `else` branch is chosen if one of the other branches with a finite probability is not selected. Note that only up to one action is chosen per actor per branches set for each simulation (mutually exclusive actions).

<br>

Actions
-------------------------------------------------------------------------------
The simulation starts in state 0 and then moves to the next state for each raise. In other words, each state represents a round of funding with some delay between. The simulation ends (reaches a terminal state) when there is an exit event (fail, IPO, sell). Note that simulations do not consider options which vest after IPO or sale. [See more about states](https://en.wikipedia.org/wiki/Markov_chain). The following actions are available:

 - **fail()**: Takes no arguments and assumes company share value becomes effecively zero. Will not consider [different classes of stocks](https://www.upcounsel.com/classes-of-stock). Example: `fail()`.
 - **sell([low] - [high] [units])**: The company sells or merges with another company such that stocks can be sold afterwards. The range is two numbers separated by a dash followed by units of either "total" (total company value) or "share" (per share value). Example: `sell(500,000,000 - 1,000,000,000 total)`.
 - **ipo([low] - [high] [units])**: The company has an initial public offering such that stocks can be sold afterwards. The range at which shares can be sold is two numbers separated by a dash followed by units of either "total" (total company value) or "share" (per share value). Example: `ipo(500,000,000 - 1,000,000,000 total)`. Note that this assumes the price at which shraes can acutally be sold after [lockup period](https://www.ipohub.org/ipo-lockups-overview-and-exceptions) or equivalent.
 - **raise([low] - [high] fmv diluting [low] - [high]% wait [low] - [high] months then { branches })**: The company does a new fund raise, moving into the provided set of branches. The first range defines the new [FMV](https://every.to/p/what-should-you-do-with-your-options-during-a-downturn), percent of [dilution](https://finerva.com/report/dilution-data-funding-rounds/) (0 - 100 values), wait until next state in months (months before next branches evaluated), and then a new set of branches. Those branches will only be visited if the raise happens. Example: `raise(2 - 3 fmv diluting 10 - 20% wait 12 - 24 months then {...})`.
 - **quit()**: Action in which the employee is simulated to have left their position. Assumes no [acceleration](https://www.cooleygo.com/what-are-single-and-double-trigger-acceleration-and-how-do-they-work/). Example: `quit()`.
 - **buy([amount]%)**: Simulates employee exercising a certain percent of "available" options. Available here means options which have vested but not yet exercised. Example: `buy(10%)`.

Commas are allowed (and ignored) for parameter values as desired for readability.

<br>

Example
-------------------------------------------------------------------------------
Below is a simple example simulation:

```
[totalGrant=100 strikePrice=1 startFMV=1 startTotalShares=100,000 startVestingMonths=10 immediatelyVest=20 monthlyVest=10 optionTax=26 regularIncomeTax=33 longTermTax=20 startMonthLow=5 startMonthHigh=15 ipoBuy=100 sellBuy=90 quitBuy=90 waitToSell=0 rangeStd=2 useLogNorm=0]
{
  e_0.1: buy(80%)
  |c_0.4: sell(100,000,000 - 500,000,000 share)
  |c_0.1: ipo(500,000,000 - 1,000,000,000 total)
  |c_else: raise(2 - 3 fmv diluting 10 - 20% wait 12 - 24 months then {
    c_0.45: sell(200,000,000 - 700,000,000 total)
    |c_0.55: ipo(500,000,000 - 1,500,000,000 total)
  })
}
```
