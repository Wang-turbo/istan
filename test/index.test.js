const commonDivision = require('../source');
const { expect } = require('chai');
describe('b!=0', function () {
    it('a>b', () => {
        const num1 = 3;
        const num2 = 2;
        const ontput1 = 1;
        expect(commonDivision(num1,num2)).to.be.equal(ontput1);
    });
    it('a<b', () => {
        const num1 = 1;
        const num2 = 2;
        const ontput1 = 1;
        expect(commonDivision(num1,num2)).to.be.equal(ontput1);
    });
    it('a==b', () => {
        const num1 = 1;
        const num2 = 1;
        const ontput1 = 1;
        expect(commonDivision(num2,num1)).to.be.equal(ontput1);
    });
    
});
describe('b==0', function () {
    it('return a', () => {
        const num5 = 3;
        const num6 = 0;
        const ontput3 = 3;
        expect(commonDivision(num5,num6)).to.be.equal(ontput3);
    });
})