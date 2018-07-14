const { isArr } = require("./util")

module.exports = (jobs, cb) => {
  let next, n;
  if (!isArr(jobs) || !(n = jobs.length))
    throw new Error("requires non-empty array of jobs");
  (next = (i, xargs) => jobs[i++]((...[err, ...res]) => {
    return err || i === n ? cb && cb(err, ...res) : next(i, res)
  }, ...xargs))(0,[])
}
