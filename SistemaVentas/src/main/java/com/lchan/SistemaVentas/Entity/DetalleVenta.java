package com.lchan.SistemaVentas.Entity;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "detalleventa")
public class DetalleVenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "codigo_detalle_venta")
    private Integer codigoDetalleVenta;

    @Column(name = "cantidad")
    private Integer cantidad;

    @Column(name = "precio_unitario")
    private BigDecimal precioUnitario;

    @Column(name = "subtotal")
    private BigDecimal subtotal;

    @ManyToOne
    @JoinColumn(name = "productos_codigo_producto")
    private Productos producto;

    @ManyToOne
    @JoinColumn(name = "ventas_codigo_venta")
    private Ventas venta;

    public Integer getCodigoDetalleVenta() { return codigoDetalleVenta; }
    public void setCodigoDetalleVenta(Integer codigoDetalleVenta) { this.codigoDetalleVenta = codigoDetalleVenta; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public Productos getProducto() { return producto; }
    public void setProducto(Productos producto) { this.producto = producto; }

    public Ventas getVenta() { return venta; }
    public void setVenta(Ventas venta) { this.venta = venta; }
}