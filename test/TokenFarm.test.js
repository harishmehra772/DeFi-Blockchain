const { assert } = require('chai');

const DappToken = artifacts.require('DappToken')
const DaiToken = artifacts.require('DaiToken')
const TokenFarm = artifacts.require('TokenFarm')


require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n){
    return web3.utils.toWei(n,'ether');
}


contract(TokenFarm,([owner,investor])=>{
    let daiToken,dappToken,tokenFarm

    before(async()=>{
        daiToken=await DaiToken.new()
        dappToken=await DappToken.new()
        tokenFarm=await TokenFarm.new(dappToken.address,daiToken.address)

        await dappToken.transfer(tokenFarm.address,tokens('1000000'))

        await daiToken.transfer(investor,tokens('100'),{from :owner})
    })


    describe('Mock DAI deployment',async()=>{
        it('has a name',async()=>{
            
            const name=await daiToken.name()
            assert.equal(name,'Mock DAI Token')
        })
    })



    describe('Dapp Token deployment',async()=>{
        it('has a name',async()=>{
            
            const name=await dappToken.name()
            assert.equal(name,'DApp Token')
        })
    })


    describe('Token Farm deployment',async()=>{
        it('has a name',async()=>{
            const name=await tokenFarm.tokenName()
            assert.equal(name,'Dapp token farm')
        })

        it('contract has tokens',async()=>{
            
            let balance=await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(),tokens('1000000'))
        })

    })

    describe('Farming Tokens',async()=>{
        it('reward investors for staking mDai Tokens',async()=>{
            let result
            result=await daiToken.balanceOf(investor)
            assert.equal(result.toString(),tokens('100'),'investor balance is correct before investing')

            await daiToken.approve(tokenFarm.address,tokens('100'),{from:investor})
            await tokenFarm.stakeTokens(tokens('100'),{from:investor})

            result=await daiToken.balanceOf(investor)
            assert.equal(result.toString(),tokens('0'),'investor balance is correct after investing')

            result=await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(),tokens('100'),'token farm balance after investing')

            result=await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(),tokens('100'),'investor staking balance after  investing')

            result=await tokenFarm.isStaking(investor)
            assert.equal(result.toString(),'true','investor balance before investing')

            await tokenFarm.issueTokens({from :owner})

            result=await dappToken.balanceOf(investor)
            assert.equal(result.toString(),tokens('100'),'investor DApp Token balance after investing')

            await tokenFarm.issueTokens({from:investor}).should.be.rejected;
            

            await tokenFarm.unstakeTokens({from:investor})

            result=await daiToken.balanceOf(investor)
            assert.equal(result.toString(),tokens('100'),'investor DAI balance in the wallet')

            result=await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(),tokens('0'),'Token Farm DAI balance in the wallet')

            result=await tokenFarm.isStaking(investor)
            assert.equal(result.toString(),'false','investor balance before investing')


        })
    })



})