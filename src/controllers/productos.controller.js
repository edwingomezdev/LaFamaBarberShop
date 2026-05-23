const prisma = require('../prisma')

const obtenerProductos = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      where: { activo: true },
      orderBy: { createdAt: 'asc' }
    })
    res.json(productos)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagen, categoria, badge, stock } = req.body
    const producto = await prisma.producto.create({
      data: { nombre, descripcion, precio: Number(precio), imagen, categoria, badge, stock: Number(stock) || 0 }
    })
    res.status(201).json(producto)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

const actualizarProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagen, categoria, badge, stock, activo } = req.body
    const producto = await prisma.producto.update({
      where: { id: Number(req.params.id) },
      data: { nombre, descripcion, precio: Number(precio), imagen, categoria, badge, stock: Number(stock), activo }
    })
    res.json(producto)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

const eliminarProducto = async (req, res) => {
  try {
    await prisma.producto.update({
      where: { id: Number(req.params.id) },
      data: { activo: false }
    })
    res.json({ mensaje: 'Producto eliminado' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error interno' })
  }
}

module.exports = { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto }