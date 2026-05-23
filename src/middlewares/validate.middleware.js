const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)

  if (!result.success) {
    const errores = result.error.issues.map(e => ({
      campo: e.path.join('.'),
      mensaje: e.message
    }))
    return res.status(400).json({ errores })
  }

  req.body = result.data
  next()
}

module.exports = validate