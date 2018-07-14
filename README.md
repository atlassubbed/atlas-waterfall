# atlas-waterfall

Run async functions in a "waterfall" series with an onDone callback.

[![Travis](https://img.shields.io/travis/atlassubbed/atlas-waterfall.svg)](https://travis-ci.org/atlassubbed/atlas-waterfall)

---

## install 

```
npm install --save atlas-waterfall
```

## why

If you want to avoid promises, you can use a waterfall instead. It will run an array of `N` async functions in serial, passing the `(err, ...results)` from one function to the next. The `allDone` callback receives the `(err, ...results)` from the very last function. See examples below.

## examples

#### array of jobs

The following will run `reddit.post` with the results/error from `email.send`, and the final callback with the results from `reddit.post`:

```javascript
const waterfall = require("atlas-waterfall");
waterfall([
  done => email.send("atlassubbed@jee-mail.com", "hello", (emailErr, isSuccess, id) => {
    // can pass many results to next job in the waterfall
    if (emailErr) return done(emailErr, "failed early...")
    done(null, isSuccess, id)
  }),
  (done, isSuccess, id) => {
    const subreddit = isSuccess ? "mildlyinteresting" : "mildlyinfuriating"
    reddit.post("atlassubbed.png", subreddit, postErr => {
      done(postErr, "tried", "all tasks");
    })
  }
], (err, ...res) => {
  // if email failed: err === emailErr, res === ["failed early..."]
  // if post failed: err === postErr, res === ["tried", "all tasks"]
  // if no errors: err === null, res === ["tried", "all tasks"]
})
```

## caveats

If any function in the sequence returns an error, the remainder of the sequence will be skipped, and the `allDone` callback will be called with the error. Sometimes, a task will fail but you will still need to run the remaining functions -- in this case, simply handle the error instead of passing it as the first argument to the task's `done` callback.

## todo

Passing initial args might be useful:

```
waterfal(...args, [
  (done, ...args) => {

  },
  ...otherJobs
], allDone)
```

It would be more symmetric and aesthetic to allow initial args to be passed to the first job, since the last job's results are passed to `allDone`.
