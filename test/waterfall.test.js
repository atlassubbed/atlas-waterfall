const { describe, it } = require("mocha")
const { expect } = require("chai")
const { makeAsyncJob } = require("./util")
const waterfall = require("../src/waterfall")

describe("waterfall", function(){

  const job1 = makeAsyncJob(20)
  const job2 = makeAsyncJob(200)
  const job3 = makeAsyncJob(0, new Error("job3"))

  it("throws an error if not passed an non-empty array", function(){
    const problemArgs = [NaN, Infinity, true, 22/7, 5, done => {}, "str", /reg/, new Date(), [], {}, null, undefined]
    problemArgs.forEach(arg => {
      expect(() => waterfall(arg)).to.throw("requires non-empty array of jobs")
    })
  })
  describe("works with an array of async functions", function(){
    it("should run each function in serial", function(testDone){
      let numRunning = 0;
      waterfall([
        done => {
          expect(++numRunning).to.equal(1)
          job1(() => {
            done(null, numRunning--)
          })
        },
        done => {
          expect(++numRunning).to.equal(1)
          job2(() => {
            done(null, numRunning--)
            testDone()
          })
        }
      ])
    })
    it("should call the callback with no error after all functions successfully complete", function(testDone){
      let numRunning = 2;
      waterfall([
        done => {
          job1(() => {
            done(null, numRunning--)
          })
        },
        done => {
          job2(() => {
            done(null, numRunning--)
          })
        }
      ], err => {
        expect(err).to.be.null
        expect(numRunning).to.equal(0)
        testDone()
      })
    })
    it("should abort and return the first encountered error immediately", function(testDone){
      let numRan = 0, numErr = 0;
      waterfall([
        done => {
          numRan++, job1(done)
        },
        done => {
          numRan++, job3(err => {
            if (err) numErr++;
            done(err)
          })
        },
        done => {
          numRan++, job2(done)
        }
      ], err => {
        expect(err).to.be.an("error")
        expect(err.message).to.equal("job3")
        expect(numRan).to.equal(2)
        expect(numErr).to.equal(1);
        testDone();
      })
    })
    it("should properly chain return values between all functions", function(testDone){
      let numRan = 0; res1 = [1, true, "result1"], res2 = ["result2", {other: 1234}]
      waterfall([
        (done, err, ...args) => {
          expect(done).to.be.a("function");
          expect(err).to.be.null;
          expect(args).to.deep.equal([])
          numRan++, job1(err => {
            done(err, ...res1)
          })
        },
        (done, err, ...args) => {
          expect(done).to.be.a("function");
          expect(err).to.be.null;
          expect(args).to.deep.equal(res1);
          numRan++, job2(err => {
            done(err, ...res2)
          })
        }
      ], (err, ...args) => {
        expect(numRan).to.equal(2)
        expect(err).to.be.null;
        expect(args).to.deep.equal(res2)
        testDone();
      })
    })
  })
})
