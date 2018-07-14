const { isArr } = require("./util")

module.exports = (jobs, cb) => {
  let next, n;
  if (!isArr(jobs) || !(n = jobs.length)) 
    throw new Error("requires non-empty array of jobs");
  (next = (i, xargs) => jobs[i++]((...args) => {
    return args[0] || i === n ? cb && cb(...args) : next(i, args)
  }, ...xargs))(0,[null])
}
