const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Test Smart Contract', function () {

    let unrestrictedOwner, restrictedOwner;
    let deployer, user, attacker;

    before(async function () {

        [deployer, user, attacker] = await ethers.getSigners();

        // Deploy
        const UnrestrictedOwnerFactory = await ethers.getContractFactory(
            'TestUnrestrictedOwner',
            deployer
        );
        unrestrictedOwner = await UnrestrictedOwnerFactory.deploy();
        const RestrictedOwnerFactory = await ethers.getContractFactory(
            'TestRestrictedOwner',
            deployer
        );
        restrictedOwner = await RestrictedOwnerFactory.deploy(this.unrestrictedOwner.address);
        
        // Any user can take ownership on `UnrestrictedOwner` contract
        await expect(unrestrictedOwner.connect(user).changeOwner(user.address)).not.to.be.reverted;
        expect(await unrestrictedOwner.owner()).to.equal(user.address);

        // Any user can't take ownership on `RestrictedOwner` contract
        expect(restrictedOwner.connect(user).updateSettings(user.address, user.address)).to.be.reverted;
        expect(await restrictedOwner.owner()).to.equal(deployer.address);
        expect(await restrictedOwner.manager()).to.equal(deployer.address);
    });

    it('Test Exploit', async function () {

    });

    after(async function () {
        
        // Attacker should take ownership on `RestrictedOwner` contract
        expect(await this.restrictedOwner.owner()).to.equal(attacker.address);
        expect(await this.restrictedOwner.manager()).to.equal(attacker.address);
    });
});