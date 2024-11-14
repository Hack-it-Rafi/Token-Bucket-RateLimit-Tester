const redisClient = require("../config/redisClient");
const moment = require('moment');

const rateLimiter = async (req, res, next) => {
  const bucketKey = 'token_bucket';
  const capacity = 10; 
  const interval = 1; 

  const currentTime = moment().unix();

  const luaScript = `
    local capacity = tonumber(ARGV[1])
    local interval = tonumber(ARGV[2])
    local currentTime = tonumber(ARGV[3])
    
    local bucketInfo = redis.call("HGETALL", KEYS[1])
    local tokens, lastRefillTime

    if #bucketInfo == 0 then
      tokens = capacity
      lastRefillTime = currentTime
    else
      for i = 1, #bucketInfo, 2 do
        if bucketInfo[i] == "tokens" then
          tokens = tonumber(bucketInfo[i + 1])
        elseif bucketInfo[i] == "lastRefillTime" then
          lastRefillTime = tonumber(bucketInfo[i + 1])
        end
      end
    end

    local elapsedTime = currentTime - lastRefillTime
    local tokensToAdd = math.floor(elapsedTime / interval)
    tokens = math.min(capacity, tokens + tokensToAdd)
    lastRefillTime = currentTime

    if tokens > 0 then
      tokens = tokens - 1
      redis.call("HSET", KEYS[1], "tokens", tokens, "lastRefillTime", lastRefillTime)
      return {tokens, capacity}
    else
      redis.call("HSET", KEYS[1], "tokens", tokens, "lastRefillTime", lastRefillTime)
      return {tokens, capacity}
    end
  `;

  const [remainingTokens, limit] = await redisClient.eval(luaScript, {
    keys: [bucketKey],
    arguments: [capacity.toString(), interval.toString(), currentTime.toString()],
  });

  res.setHeader('X-Ratelimit-Limit', limit);
  res.setHeader('X-Ratelimit-Remaining', Math.max(0, remainingTokens));

  if (remainingTokens > 0) {
    next();
  } else {
    const retryAfter = interval; 
    res.setHeader('X-Ratelimit-Retry-After', retryAfter);
    res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. Try again later.',
    });
  }
};

module.exports = rateLimiter;
