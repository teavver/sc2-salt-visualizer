
export enum Env {
    PROD = 0,
    DEBUG = 1
}

export const ENV = Env.DEBUG
console.log("ENV mode: ", ENV)