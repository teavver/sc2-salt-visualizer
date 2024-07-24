
export const format_err = (err: Error) => {
    console.log("======")
    console.log(err.name, err.message)
    err.message && console.log(err.message)
    console.log("======")
}
