const prisma = require('../prisma')

const listar = () =>
  prisma.producto.findMany({ where: { activo: true }, orderBy: { createdAt: 'asc' } })

const crear = ({ nombre, descripcion, precio, imagen, categoria, badge, stock }) =>
  prisma.producto.create({
    data: { nombre, descripcion, precio: Number(precio), imagen, categoria, badge, stock: Number(stock) || 0 },
  })

const actualizar = (id, { nombre, descripcion, precio, imagen, categoria, badge, stock, activo }) =>
  prisma.producto.update({
    where: { id: Number(id) },
    data: { nombre, descripcion, precio: Number(precio), imagen, categoria, badge, stock: Number(stock), activo },
  })

const eliminar = (id) =>
  prisma.producto.update({ where: { id: Number(id) }, data: { activo: false } })

module.exports = { listar, crear, actualizar, eliminar }
