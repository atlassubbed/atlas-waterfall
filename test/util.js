const makeAsyncJob = (timeout, error) => done => {
  setTimeout(() => done(error || null), timeout)
}

module.exports = { makeAsyncJob }
