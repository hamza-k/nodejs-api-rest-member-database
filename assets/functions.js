exports.success = (result) => {
    return {
        status: 'Success',
        result: result
    }
}

exports.error = (message) => {
    return {
        status: 'Error',
        message: message
    }
}

exports.isErr = (err) => {
    return err instanceof Error
}

exports.returnResult = (e) => {
    return this.isErr(e) ? this.error(e.message) : this.success(e)
}