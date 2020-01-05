let db, config

module.exports = (_db, _config) => {
    db = _db
    config = _config
    return Members
}

let Members = class {

    static getByID(id) {

        return new Promise((next) => {

            db.query('SELECT * FROM members WHERE `m_id` = ?', [id])
            .then((results) => {
                if (results[0] != undefined) {
                    next(results[0])
                  } else {
                    next(new Error(config.error.wrongID))
                  }
            })
            .catch( err => next(err))

        })

    }

    static getAll(maxValue = undefined){
        return new Promise((next) => {
            if (maxValue != undefined && maxValue > 0) {
                db.query('SELECT * FROM members LIMIT 0, ' + maxValue )
                .then((results) => {
                    next(results)
                }).catch( err => next(err))
            } else if ( maxValue < 0 ) {
                next(new Error(config.error.wrongValue))
            } else {
                db.query('SELECT * FROM members')
                .then((results) => {
                    next(results)
                }).catch( err => next(err))
            }
        })
    }

    static addMember(el) {
        return new Promise((next) => {
            if (el) {
                db.query('SELECT * FROM members WHERE m_name = ?', [el])
                .then((results) => {
                    if (results[0] != undefined) {
                        next(new Error(config.error.takenValue))
                    } else {
                        db.query('INSERT INTO members (`m_name`) VALUES (?)', [el])
                        .then((results) => {
                            db.query('SELECT * FROM members WHERE m_name = ?', [el])
                            .then((results) => {
                                next(results)
                            })
                            .catch( err => next(err) )
                        })
                        .catch( err => next(err))
                    }
                })
                .catch( err => next(err) )
            } else {
                next(new Error(config.error.noValue))
            }
        })
    }

    static editMember(id, el){
        return new Promise((next) => {
            if (el != '') {
                db.query('SELECT * FROM members WHERE m_id = ?', [id])
                .then((results) => {
                    if (results[0] != undefined) {
                        db.query('SELECT * FROM members WHERE m_name = ? AND m_id != ?', [el, id])
                        .then((results) => {
                            if (results[0] != undefined) {
                                next(new Error(config.error.takenValue))
                            } else {
                                db.query('UPDATE members SET m_name = ? WHERE m_id = ?', [el, id])
                                .then((results) => {
                                    db.query('SELECT * FROM members WHERE m_id = ?', [id])
                                    .then((results) => {
                                        next(results)
                                    })
                                    .catch( err => next(err) )
                                })
                                .catch( err => next(err) )
                            }
                        })
                        .catch( err => next(err) )
                    } else {
                        next(new Error(config.error.wrongID))
                    }
                })
                .catch( err => next(err) )
            } else {
                next(new Error(config.error.noValue))
            }
        })
    }

    static deleteMember(id){
        return new Promise((next) => {
            db.query('SELECT * FROM members WHERE m_id = ?', [id])
            .then((results) => {
                if (results[0] != undefined) {
                    db.query('DELETE FROM members WHERE m_id = ?', [id])
                    .then((results) => {
                        db.query('SELECT * FROM members')
                        .then((results) => {
                            next(results)
                        })
                        .catch( err => next(err) )
                    })
                    .catch( err => next(err) )
                } else {
                    next(new Error(config.error.noID))
                }
            })
            .catch( err => next(err) )
        })
    }

}