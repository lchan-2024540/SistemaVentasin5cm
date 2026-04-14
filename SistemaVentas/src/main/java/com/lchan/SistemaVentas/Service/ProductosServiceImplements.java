package com.lchan.SistemaVentas.Service;
import com.lchan.SistemaVentas.Entity.Productos;
import com.lchan.SistemaVentas.Repository.ProductoRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductosServiceImplements implements ProductosService {

    private final ProductoRepository productoRepository;

    public ProductosServiceImplements(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @Override
    public List<Productos> getAllProductos() {
        return productoRepository.findAll();
    }

    @Override
    public Productos getProductosById(Integer codigoProducto) {
        return productoRepository.findById(codigoProducto).orElse(null);
    }

    @Override
    public Productos saveProductos(Productos productos) throws RuntimeException {
        return productoRepository.save(productos);
    }

    @Override
    public Productos updateProductos(Integer codigoProducto, Productos productos) {
        Productos producto1 = productoRepository.findById(codigoProducto).orElse(null);

        if (producto1 != null) {
            producto1.setNombreProducto(productos.getNombreProducto());
            producto1.setPrecio(productos.getPrecio());
            producto1.setStock(productos.getStock());
            producto1.setEstado(productos.getEstado());
        } else {
            throw new RuntimeException("Producto no encontrado");
        }

        return productoRepository.save(producto1);
    }

    @Override
    public void deleteProductos(Integer codigoProducto) {
        Productos producto = productoRepository.findById(codigoProducto).orElse(null);

        if (producto == null) {
            throw new RuntimeException("Producto no encontrado");
        }

        productoRepository.delete(producto);
    }
}