require("dotenv").config();

const redis = require("redis");

const endpoint = process.env.REDIS_ENDPOINT_URL || "127.0.0.1:6379";
const password = process.env.REDIS_PASSWORD || null;

const [host, port] = endpoint.split(":");

const resolvePromise = (resolve, reject) => {
  return (err, data) => {
    if (err) {
      reject(err);
    }
    resolve(data);
  };
};

const auth = (client) =>
  new Promise((a, b) => {
    if (password === null) {
      a(true);
    } else {
      client.auth(password, resolvePromise(a, b));
    }
  });

const client = redis.createClient(+port, host);
const sub = redis.createClient(
  +port,
  host,
  password === null
    ? undefined
    : {
        password,
      }
);

// 모듈에 exports할 함수와 객체들입니다.
module.exports = {
  client, // Redis 클라이언트
  sub, // Redis subscriber 클라이언트
  auth: async () => {
    // Redis 인증 함수
    await auth(client)
      .then(() => {
        client.select(1, (err) => {
          if (err) {
            throw Error("Error selecting database:", err);
          }
          console.log("Connected to Redis DB 1");
        });
      })
      .catch((err) => {
        console.error("Error authenticating:", err);
      });
    await auth(sub);
  },
  // Redis의 여러 기능을 Promise를 통해 래핑한 함수들입니다.
  // 예를 들어, incr 함수는 Redis의 INCR 명령을 Promise로 래핑한 것입니다.

  // 숫자열 값 증가
  incr: (key = "key") => new Promise((a, b) => client.incr(key, resolvePromise(a, b))),

  // 숫자열 값 감소
  decr: (key = "key") => new Promise((a, b) => client.decr(key, resolvePromise(a, b))),

  // 해시 여러개 저장
  hmset: (key = "key", values = []) =>
    new Promise((a, b) => client.hmset(key, values, resolvePromise(a, b))),

  // 해당 키값 있는지 확인
  exists: (key = "key") => new Promise((a, b) => client.exists(key, resolvePromise(a, b))),

  // 해당 해시값 있는지 확인
  hexists: (key = "key", key2 = "") =>
    new Promise((a, b) => client.hexists(key, key2, resolvePromise(a, b))),

  // 키-벨류 저장
  set: (key = "key", value) => new Promise((a, b) => client.set(key, value, resolvePromise(a, b))),

  // 키-벨류 조회
  get: (key = "key") => new Promise((a, b) => client.get(key, resolvePromise(a, b))),

  // 모든 해시데이터 조회
  hgetall: (key = "key") => new Promise((a, b) => client.hgetall(key, resolvePromise(a, b))),

  // Sorted Set에서 점수를 기준으로 지정한 범위 데이터 조회
  zrangebyscore: (key = "key", min = 0, max = 1) =>
    new Promise((a, b) => client.zrangebyscore(key, min, max, resolvePromise(a, b))),

  // Sorted Set에 멤버 추가
  zadd: (key = "key", key2 = "", value) =>
    new Promise((a, b) => client.zadd(key, key2, value, resolvePromise(a, b))),

  // Set에 멤버 추가
  sadd: (key = "key", value) =>
    new Promise((a, b) => client.sadd(key, value, resolvePromise(a, b))),

  // hash에서 여러 필드의 값을 조회
  hmget: (key = "key", key2 = "") =>
    new Promise((a, b) => client.hmget(key, key2, resolvePromise(a, b))),

  // Set에 멤버가 있는지 확인
  sismember: (key = "key", key2 = "") =>
    new Promise((a, b) => client.sismember(key, key2, resolvePromise(a, b))),

  // Set에 모든 멤버를 조회
  smembers: (key = "key") => new Promise((a, b) => client.smembers(key, resolvePromise(a, b))),

  // Set에서 멤버를 제거
  srem: (key = "key", key2 = "") =>
    new Promise((a, b) => client.srem(key, key2, resolvePromise(a, b))),
};

// 위 코드에 자세한 주석을 달아 코드의 목적과 역할을 설명하였습니다.
// Redis 클라이언트와 Redis subscriber 클라이언트를 생성했습니다.
// 인증 기능을 수행하는 auth 함수와 Redis 명령들을 Promise로 래핑하여 제공합니다.
// 이 코드는 Redis 서버와 상호작용하기 위한 클라이언트를 만드는 것으로, 주로 비동기적인 Redis 명령을 Promise로 래핑하여 제공합니다.
